import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TplInfoComponent } from './tpl-info.component';

describe('TplInfoComponent', () => {
  let component: TplInfoComponent;
  let fixture: ComponentFixture<TplInfoComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TplInfoComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TplInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
