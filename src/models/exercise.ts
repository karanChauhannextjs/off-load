export interface ICreateExerciseAnswer {
  therapistUuid?: string
  exerciseUuid: string
  answers: any
}

export interface IUnJoinExerciseBody{
  exerciseUuid: string
}