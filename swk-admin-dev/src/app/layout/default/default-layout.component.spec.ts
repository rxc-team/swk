/*
 * @Description: ディフォルトレイアウトコントローラー
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-06-18 17:21:47
 */
// angular フレームワークライブラリ
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

// カスタムサービスまたは管理
import { DefaultLayoutComponent } from './default-layout.component';

describe('DefaultLayoutComponent', () => {
  let component: DefaultLayoutComponent;
  let fixture: ComponentFixture<DefaultLayoutComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DefaultLayoutComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
