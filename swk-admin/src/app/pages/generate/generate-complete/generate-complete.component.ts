import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenService } from '@api';

import { StepService } from '../step.service';

@Component({
  selector: 'app-generate-complete',
  templateUrl: './generate-complete.component.html',
  styleUrls: ['./generate-complete.component.less']
})
export class GenerateCompleteComponent implements OnInit {
  constructor(private gs: GenService, private sts: StepService, private router: Router) {}

  ngOnInit(): void {}

  async again() {
    await this.gs.complete();
    this.sts.init(0);
  }

  async done() {
    await this.gs.complete();
    this.router.navigate(['datastores', 'list']);
  }
}
