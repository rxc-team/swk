import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupTreeComponent } from './group-tree.component';

describe('GroupTreeComponent', () => {
  let component: GroupTreeComponent;
  let fixture: ComponentFixture<GroupTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GroupTreeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
