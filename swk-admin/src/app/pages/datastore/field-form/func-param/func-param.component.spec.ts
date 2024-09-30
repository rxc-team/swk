import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncParamComponent } from './func-param.component';

describe('FuncParamComponent', () => {
  let component: FuncParamComponent;
  let fixture: ComponentFixture<FuncParamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FuncParamComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FuncParamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
