import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenService } from '@api';

import { StepService } from '../step.service';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.less']
})
export class GenerateComponent implements OnInit {
  current = 0;

  constructor(private router: Router, private gs: GenService, private sts: StepService) {}

  ngOnInit(): void {
    this.gs.getConfig().then(data => {
      if (data) {
        this.sts.init(data.step + 1);
      } else {
        this.sts.init(0);
      }
    });

    this.sts.change.subscribe(data => {
      this.current = data;
      this.changeContent();
    });
  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        this.router.navigateByUrl('/generate/upload');
        break;
      }
      case 1: {
        this.router.navigateByUrl('/generate/datastore/set');
        break;
      }
      case 2: {
        this.router.navigateByUrl('/generate/field/set');
        break;
      }
      case 3: {
        this.router.navigateByUrl('/generate/datastore/save');
        break;
      }
      case 4: {
        this.router.navigateByUrl('/generate/mapping/save');
        break;
      }
      case 5: {
        this.router.navigateByUrl('/generate/complete');
        break;
      }
      default: {
      }
    }
  }
}
