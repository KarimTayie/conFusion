import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { baseURL } from '../shared/baseurl';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { DISHES } from '../shared/dishes';


@Injectable({
  providedIn: 'root'
})
export class DishService {

  constructor(private http: HttpClient) { }

  getDishes(): Observable<Dish[]> {
    return this.http.get<Dish[]>(baseURL + 'dishes');
  }

  getDish(id: number): Observable<Dish> {
    return this.http.get<Dish>(baseURL + 'dishes/' + id);
  }

  getFeaturedDish(): Observable<Dish> {
    return this.http.get<Dish[]>(baseURL + 'dishes?featured=true').pipe(
      map(dishes => dishes[0])
    );
  }

  getDishIds(): Observable<string[] | any> {
    return this.getDishes().pipe(
      map(dishes => dishes.map(dish => dish.id)));
  }

  postComment(dishId: number, comment: Comment) {
    DISHES.forEach(dish => {
      if (dish.id === dishId) {
        dish.comments.push(comment);
      }
    });
  }

}
