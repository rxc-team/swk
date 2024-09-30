import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-change-history',
  templateUrl: './change-history.component.html',
  styleUrls: ['./change-history.component.less']
})
export class ChangeHistoryComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) { }

  @Input() showText = false;
  @Input() canCheck = false;

  visible = false;

  gridStyle = {
    height: '150px',
    width: '50%',
    'line-height': '50px',
    textAlign: 'center'
  };

  ngOnInit(): void {
    if (localStorage.getItem("canCheck") == 'true') {
      this.canCheck = true
    } else {
      this.canCheck = false
    }
    if (this.canCheck) {
      this.gridStyle = {
        height: '150px',
        width: '50%',
        'line-height': '50px',
        textAlign: 'center'
      };
    } else {
      this.gridStyle = {
        height: '150px',
        width: '100%',
        'line-height': '50px',
        textAlign: 'center'
      };
    }
  }

  onCancel() {
    this.visible = false;
  }

  show() {
    this.visible = true;
  }

  /**
   * @description: 跳转到履历画面
   */
  showHistory() {
    this.visible = false;
    setTimeout(() => {
      const datastoreId = this.route.snapshot.paramMap.get('d_id');
      this.router.navigateByUrl(`/datastores/${datastoreId}/history`);
    }, 100);
  }
  /**
   * @description: 跳转到履历画面
   */
  showCheckHistory() {
    this.visible = false;
    setTimeout(() => {
      const datastoreId = this.route.snapshot.paramMap.get('d_id');
      this.router.navigateByUrl(`/datastores/${datastoreId}/checkHistory`);
    }, 100);
  }
}
