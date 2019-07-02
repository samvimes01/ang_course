import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { TrainingService } from '../training.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { Exercise } from '../exercise.model';


@Component({
  selector: 'app-past-trainings',
  templateUrl: './past-trainings.component.html',
  styleUrls: ['./past-trainings.component.css']
})
export class PastTrainingsComponent implements OnInit, AfterViewInit {

  displayedColumns = ['date', 'name', 'duration', 'calories', 'state'];
  dataSource = new MatTableDataSource<Exercise>();
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private trainingService: TrainingService) {}

  excerciseSubscription: Subscription;

  ngOnInit() {
    this.trainingService.fetchCompletedOrCancelledExercises();
    this.excerciseSubscription = this.trainingService.finishedExercisesChanged.subscribe((exercises: Exercise[]) => this.dataSource.data = exercises);
  }

  ngOnDestroy(): void {
    this.excerciseSubscription.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLocaleLowerCase();
  }

}
