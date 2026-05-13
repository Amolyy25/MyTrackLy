import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const prisma = new PrismaClient()
const SQL_FILE = path.join(__dirname, '../../../../backup.sql')

// Parse a COPY section from a PostgreSQL dump
function parseCopySection(sql: string, table: string): Record<string, string | null>[] {
  const escaped = table.replace('.', '\\.')
  const pattern = `COPY ${escaped} \\(([^)]+)\\) FROM stdin;\n([\\s\\S]*?)\n\\\\.`
  const regex = new RegExp(pattern)
  const match = regex.exec(sql)
  if (!match) {
    console.warn(`  [WARN] Table ${table} not found in dump`)
    return []
  }
  const columns = match[1].split(', ').map(c => c.trim())
  const lines = match[2].split('\n').filter(l => l.trim().length > 0)
  return lines.map(line => {
    const vals = line.split('\t')
    const obj: Record<string, string | null> = {}
    columns.forEach((col, i) => {
      obj[col] = (vals[i] === '\\N' || vals[i] === undefined) ? null : vals[i]
    })
    return obj
  })
}

function unescapeValue(v: string | null): string | null {
  if (!v) return v
  return v.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\').trim() || null
}

async function main() {
  if (!fs.existsSync(SQL_FILE)) {
    throw new Error(`backup.sql not found at: ${SQL_FILE}`)
  }

  console.log('Reading backup.sql...')
  const sql = fs.readFileSync(SQL_FILE, 'utf-8')

  const oldUsers        = parseCopySection(sql, 'public.users')
  const oldWorkouts     = parseCopySection(sql, 'public.workouts')
  const oldExercises    = parseCopySection(sql, 'public.exercises')
  const oldMeasurements = parseCopySection(sql, 'public.body_measurements')

  console.log(`Parsed: ${oldUsers.length} users, ${oldWorkouts.length} workouts, ${oldExercises.length} exercises, ${oldMeasurements.length} measurements\n`)

  const jolanOld = oldUsers.find(u => u.email === 'jolancleyet@gmail.com')
  if (!jolanOld) throw new Error('Coach jolancleyet@gmail.com not found in dump')
  const JOLAN_OLD_ID = jolanOld.id!

  // Map: old user ID → new user ID
  const oldToNewId = new Map<string, string>()

  // ── 1. Coach account ──────────────────────────────────────────────────────
  console.log('── 1. Coach account ──')
  let coach = await prisma.user.findUnique({ where: { email: 'jolancleyet@gmail.com' } })
  if (!coach) {
    coach = await prisma.user.create({
      data: {
        email: 'jolancleyet@gmail.com',
        name: jolanOld.full_name || 'Cleyet-Marrel Jolan',
        role: 'coach',
        passwordHash: null,
        isVirtual: false,
        allowEmails: true,
      },
    })
    console.log(`  ✓ Created coach: ${coach.name} (${coach.id})`)
  } else {
    console.log(`  → Already exists: ${coach.name} (${coach.id})`)
  }
  oldToNewId.set(JOLAN_OLD_ID, coach.id)

  // ── 2. Clients ────────────────────────────────────────────────────────────
  console.log('\n── 2. Clients ──')

  // Clients approved by Jolan in old DB
  const jolanClientOldIds = new Set<string>()
  oldUsers
    .filter(u => u.approved_by === JOLAN_OLD_ID && u.role === 'client')
    .forEach(u => jolanClientOldIds.add(u.id!))

  // Also users whose workouts were entered by Jolan (cross-coaching)
  oldWorkouts
    .filter(w => w.created_by === JOLAN_OLD_ID && w.user_id && w.user_id !== JOLAN_OLD_ID)
    .forEach(w => jolanClientOldIds.add(w.user_id!))

  console.log(`  Found ${jolanClientOldIds.size} clients to import`)

  for (const oldId of jolanClientOldIds) {
    const oldUser = oldUsers.find(u => u.id === oldId)
    if (!oldUser) { console.warn(`  [WARN] User ${oldId} not found in dump, skipping`); continue }

    const isFakeEmail = !oldUser.email || oldUser.email.includes('@noemail.local')
    const isVirtual   = isFakeEmail
    const realEmail   = isFakeEmail ? null : oldUser.email
    const dbEmail     = realEmail ?? `import-${oldId.split('-')[0]}@virtual.mytrackly.local`

    let client = await prisma.user.findUnique({ where: { email: dbEmail } })
    if (!client) {
      client = await prisma.user.create({
        data: {
          email: dbEmail,
          name: oldUser.full_name?.trim() || 'Client importé',
          role: 'eleve',
          coachId: coach.id,
          passwordHash: null,
          isVirtual,
          allowEmails: !isVirtual,
        },
      })
      console.log(`  ✓ Created: ${client.name} (${dbEmail})${isVirtual ? ' [virtuel]' : ''}`)
    } else {
      if (!client.coachId) {
        await prisma.user.update({ where: { id: client.id }, data: { coachId: coach.id, role: 'eleve' } })
        console.log(`  → Linked to coach: ${client.name}`)
      } else {
        console.log(`  → Already exists: ${client.name}`)
      }
    }
    oldToNewId.set(oldId, client.id)
  }

  // ── 3. Exercise catalog ───────────────────────────────────────────────────
  console.log('\n── 3. Exercise catalog ──')

  const relevantWorkoutIds = new Set(
    oldWorkouts
      .filter(w => w.user_id && oldToNewId.has(w.user_id))
      .map(w => w.id!)
  )
  const relevantExercises = oldExercises.filter(
    e => e.workout_id && relevantWorkoutIds.has(e.workout_id)
  )

  const uniqueNames = [
    ...new Set(relevantExercises.map(e => e.name?.trim()).filter(Boolean) as string[]),
  ]
  const exerciseCatalog = new Map<string, string>() // name → Exercise.id

  for (const name of uniqueNames) {
    let ex = await prisma.exercise.findFirst({
      where: { name, isCustom: true, createdByUserId: coach.id },
    })
    if (!ex) {
      ex = await prisma.exercise.create({
        data: {
          name,
          category: 'other',
          defaultUnit: 'reps',
          isCustom: true,
          createdByUserId: coach.id,
        },
      })
    }
    exerciseCatalog.set(name, ex.id)
  }
  console.log(`  ✓ ${exerciseCatalog.size} exercises in catalog`)

  // ── 4. Training sessions + session exercises ──────────────────────────────
  console.log('\n── 4. Training sessions ──')

  let sessionCount = 0
  let exerciseCount = 0

  for (const workout of oldWorkouts) {
    if (!workout.user_id || !oldToNewId.has(workout.user_id)) continue

    const userId = oldToNewId.get(workout.user_id)!
    const date   = new Date(`${workout.date}T12:00:00Z`)

    // Build notes: title + notes + feeling
    const noteParts: string[] = []
    const title = workout.title
    if (title && title !== "Séance d'entraînement" && title.trim()) {
      noteParts.push(`**${title.trim()}**`)
    }
    const rawNotes = unescapeValue(workout.notes)
    if (rawNotes) noteParts.push(rawNotes)
    if (workout.feeling) noteParts.push(`Ressenti : ${workout.feeling}`)
    const notes = noteParts.join('\n\n') || null

    const coachComment = unescapeValue(workout.coach_notes)

    const session = await prisma.trainingSession.create({
      data: {
        userId,
        date,
        durationMinutes: workout.duration_minutes ? parseInt(workout.duration_minutes) : null,
        notes,
        coachComment,
      },
    })
    sessionCount++

    {
      const workoutExercises = relevantExercises.filter(e => e.workout_id === workout.id)
      for (let i = 0; i < workoutExercises.length; i++) {
        const ex = workoutExercises[i]
        const exerciseId = exerciseCatalog.get(ex.name?.trim() || '')
        if (!exerciseId) continue

        let repsPerSet: number[] | null = null
        if (ex.reps_per_set) {
          try {
            const cleaned = ex.reps_per_set.replace(/^"|"$/g, '')
            const parsed  = JSON.parse(cleaned)
            if (Array.isArray(parsed)) repsPerSet = parsed.map(Number)
          } catch { /* invalid json, skip */ }
        }
        const allSame = repsPerSet && repsPerSet.length > 0 && repsPerSet.every(r => r === repsPerSet![0])

        await prisma.sessionExercise.create({
          data: {
            sessionId:    session.id,
            exerciseId,
            sets:         ex.sets ? parseInt(ex.sets) : 1,
            repsPerSet:   repsPerSet ?? undefined,
            repsUniform:  allSame ? repsPerSet![0] : null,
            weightKg:     ex.weight ? parseFloat(ex.weight) : null,
            restSeconds:  ex.rest_seconds ? parseInt(ex.rest_seconds) : null,
            orderIndex:   i,
            notes:        unescapeValue(ex.notes),
          },
        })
        exerciseCount++
      }
    }
  }
  console.log(`  ✓ ${sessionCount} sessions, ${exerciseCount} exercise entries`)

  // ── 5. Measurements ───────────────────────────────────────────────────────
  console.log('\n── 5. Measurements ──')

  // Merge duplicates: same (user_id, date) → keep non-null values
  const mergedMeasurements = new Map<string, Record<string, string | null>>()
  for (const m of oldMeasurements) {
    if (!m.user_id || !oldToNewId.has(m.user_id)) continue
    const key = `${m.user_id}|${m.date}`
    if (!mergedMeasurements.has(key)) {
      mergedMeasurements.set(key, { ...m })
    } else {
      const existing = mergedMeasurements.get(key)!
      for (const [k, v] of Object.entries(m)) {
        if (v !== null && existing[k] === null) existing[k] = v
      }
    }
  }

  let measurementCount = 0
  for (const m of mergedMeasurements.values()) {
    const userId = oldToNewId.get(m.user_id!)!
    const date   = new Date(`${m.date}T12:00:00Z`)

    const data = {
      bodyWeightKg: m.weight        ? parseFloat(m.weight)        : null,
      rightArmCm:   m.biceps_right  ? parseFloat(m.biceps_right)  : null,
      leftArmCm:    m.biceps_left   ? parseFloat(m.biceps_left)   : null,
      rightThighCm: m.thigh_right   ? parseFloat(m.thigh_right)   : null,
      leftThighCm:  m.thigh_left    ? parseFloat(m.thigh_left)    : null,
      rightCalfCm:  m.calf_right    ? parseFloat(m.calf_right)    : null,
      leftCalfCm:   m.calf_left     ? parseFloat(m.calf_left)     : null,
      chestCm:      m.chest         ? parseFloat(m.chest)         : null,
      waistCm:      m.waist         ? parseFloat(m.waist)         : null,
      hipsCm:       m.hips          ? parseFloat(m.hips)          : null,
    }

    await prisma.measurement.upsert({
      where:  { userId_date: { userId, date } },
      create: { userId, date, ...data },
      update: data,
    })
    measurementCount++
  }
  console.log(`  ✓ ${measurementCount} measurements`)

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
✅ Import complete!

  Coach  : jolancleyet@gmail.com
  Clients: ${jolanClientOldIds.size}
  Sessions: ${sessionCount}
  Exercises: ${exerciseCount}
  Measurements: ${measurementCount}

  ⚠️  Le compte coach n'a pas de mot de passe.
      Utiliser "Mot de passe oublié" sur MyTrackLy pour le définir.
  `)
}

main()
  .catch(e => { console.error('❌ Import failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
