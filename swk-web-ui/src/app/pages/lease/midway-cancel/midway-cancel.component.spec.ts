import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidwayCancelComponent } from './midway-cancel.component';

describe('MidwayCancelComponent', () => {
  let component: MidwayCancelComponent;
  let fixture: ComponentFixture<MidwayCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidwayCancelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MidwayCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
