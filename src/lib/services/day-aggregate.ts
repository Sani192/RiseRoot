import { localDateToUtcDayStart } from "@/lib/date";
import { noteRepository, taskRepository, weightRepository, workoutRepository } from "@/repositories";

export async function getDayAggregate(input: { userId: string; date: string; timezone: string }) {
  const utcDayStart = localDateToUtcDayStart(input.date, input.timezone).toISOString();
  const [tasks, workouts, note, logs] = await Promise.all([
    taskRepository.listByDate(input.userId, input.date),
    workoutRepository.listUpcoming(input.userId),
    noteRepository.findByUtcDay(input.userId, utcDayStart),
    weightRepository.listByDate(input.userId, input.date),
  ]);

  return {
    date: input.date,
    timezone: input.timezone,
    tasks: tasks.map((task) => ({ id: task.id, title: task.title, status: task.status, completed: task.status === "completed" })),
    workouts: workouts.map((w) => ({ id: w.id, title: w.name, status: w.status, complete: w.status === "completed" })),
    note: note ? { body: note.content, updatedAt: note.updatedAt } : null,
    logs: logs.map((row) => ({
      id: row.id,
      userId: row.userId,
      loggedOn: row.loggedOn,
      weightValue: row.weightValue,
      weightUnit: row.weightUnit,
      source: row.source,
    })),
  };
}
