import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppScriptComponent } from './app-script.component';

describe('AppScriptComponent', () => {
  let component: AppScriptComponent;
  let fixture: ComponentFixture<AppScriptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppScriptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
