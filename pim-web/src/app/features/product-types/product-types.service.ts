import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductType, PropertyDefinition } from './type.model';

@Injectable({ providedIn: 'root' })
export class ProductTypesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/product-types';

  listTypes(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(this.baseUrl);
  }

  getType(id: number): Observable<ProductType> {
    return this.http.get<ProductType>(`${this.baseUrl}/${id}`);
  }

  createType(data: Partial<ProductType>): Observable<ProductType> {
    return this.http.post<ProductType>(this.baseUrl, data);
  }

  updateType(id: number, data: Partial<ProductType>): Observable<ProductType> {
    return this.http.put<ProductType>(`${this.baseUrl}/${id}`, data);
  }

  activateType(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateType(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  listProps(productTypeId: number): Observable<PropertyDefinition[]> {
    return this.http.get<PropertyDefinition[]>(`${this.baseUrl}/${productTypeId}/properties`);
  }

  createProp(productTypeId: number, data: Partial<PropertyDefinition>): Observable<PropertyDefinition> {
    return this.http.post<PropertyDefinition>(`${this.baseUrl}/${productTypeId}/properties`, data);
  }

  updateProp(productTypeId: number, propId: number, data: Partial<PropertyDefinition>): Observable<PropertyDefinition> {
    return this.http.put<PropertyDefinition>(`${this.baseUrl}/${productTypeId}/properties/${propId}`, data);
  }

  activateProp(productTypeId: number, propId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${productTypeId}/properties/${propId}/activate`, {});
  }

  deactivateProp(productTypeId: number, propId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${productTypeId}/properties/${propId}/deactivate`, {});
  }
} 