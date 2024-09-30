import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniqueAddComponent } from './unique-add.component';

describe('UniqueAddComponent', () => {
  let component: UniqueAddComponent;
  let fixture: ComponentFixture<UniqueAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UniqueAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UniqueAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
