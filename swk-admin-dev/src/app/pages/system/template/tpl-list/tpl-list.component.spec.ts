import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TplListComponent } from './tpl-list.component';

describe('TplListComponent', () => {
  let component: TplListComponent;
  let fixture: ComponentFixture<TplListComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TplListComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TplListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
