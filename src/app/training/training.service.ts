import { Exercise } from './exercise.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { UIService } from '../shared/ui.service';

@Injectable()
export class TrainingService {
  constructor(private db: AngularFirestore, private uiService: UIService) { }

  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExcercises: Exercise[] = [];
  private runningExcercise: Exercise;
  private firebaseSudscription: Subscription[] = [];

  fetchAvailableExcercises() {
    this.uiService.loadingStateChanged.next(true);
    this.firebaseSudscription.push(
      this.db
        .collection('availableExercises')
        .snapshotChanges()
        .pipe(
          map(docArray => docArray.map(doc => ({
            id: doc.payload.doc.id,
            name: doc.payload.doc.data()['name'],
            duration: doc.payload.doc.data()['duration'],
            calories: doc.payload.doc.data()['calories'],
          })))
        )
        .subscribe((exercises: Exercise[]) => {
          this.uiService.loadingStateChanged.next(false);
          this.availableExcercises = exercises;
          this.exercisesChanged.next([...exercises]);
        },
        error => {
          this.uiService.loadingStateChanged.next(false);
          this.uiService.showSnackbar('Fetching Exercises failed, please try again later', null, 3000);
          this.exercisesChanged.next(null);
        })
    );
  }

  getRunninExcercise() {
    return { ...this.runningExcercise };
  }

  startExcercise(selectedId: string) {
    // this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()});
    this.runningExcercise = this.availableExcercises.find(exc => exc.id === selectedId);
    this.exerciseChanged.next({ ...this.runningExcercise });
  }

  completeExcercise() {
    this.addDataToDatabase({ ...this.runningExcercise, date: new Date(), state: 'completed' });
    this.runningExcercise = null;
    this.exerciseChanged.next(null);
  }
  cancelExcercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExcercise,
      date: new Date(),
      state: 'cancelled',
      duration: this.runningExcercise.duration * (progress / 100),
      calories: this.runningExcercise.calories * (progress / 100),
    });
    this.runningExcercise = null;
    this.exerciseChanged.next(null);
  }

  fetchCompletedOrCancelledExercises() {
    this.firebaseSudscription.push(
      this.db.collection('finishedExercises')
        .valueChanges()
        .subscribe((exercises: Exercise[]) => {
          this.finishedExercisesChanged.next([...exercises]);
        })
    );
  }

  cancelSubscriptions() {
    this.firebaseSudscription.forEach(subscription => subscription.unsubscribe());
  }

  addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }
}
