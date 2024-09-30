import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowListComponent } from './allow-list.component';

describe('AllowListComponent', () => {
  let component: AllowListComponent;
  let fixture: ComponentFixture<AllowListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllowListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
