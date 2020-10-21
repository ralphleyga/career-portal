import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { SearchService } from '../services/search/search.service';
import { Title, Meta } from '@angular/platform-browser';
import { SettingsService } from '../services/settings/settings.service';
import { Router } from '@angular/router';
import { TranslateService } from 'chomsky';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styles: [
    
  ],
})
export class JobListComponent implements OnChanges {
  @Input() public filter: any;
  @Input() public filterCount: number;
  @Input() public sidebarVisible: boolean = false;
  @Output() public displaySidebar: EventEmitter<any> = new EventEmitter();
  @Output() public showLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() public showError: EventEmitter<boolean> = new EventEmitter();

  public jobs: any[] = [];
  public title: string;
  public _loading: boolean = true;
  public moreAvailable: boolean = true;
  public total: number | '...' = '...';
  public jobInfoChips: [string|JobChipField]  = SettingsService.settings.service.jobInfoChips;
  public showCategory: boolean  = SettingsService.settings.service.showCategory;
  private start: number = 0;

  constructor(private http: SearchService, private titleService: Title, private meta: Meta, private router: Router) {
   }

  public ngOnChanges(changes: SimpleChanges): any {
    this.getData();
  }

  public jobPayRateDisplay = '';

  private roundOfPayRate(payrate) {
    return (Math.round(payrate * 4) / 4).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  public jobPayRate(payrate) {
    this.jobPayRateDisplay = payrate;
    let low_rate = 0;
    let high_rate = 0;

    if (payrate < 50) {
      low_rate = payrate * 0.9;
      high_rate = payrate * 1.2
    } else {
      low_rate = payrate * 0.8
      high_rate = payrate * 1.13
    }

    this.jobPayRateDisplay = this.roundOfPayRate(low_rate) + '-' + this.roundOfPayRate(high_rate)

    return this.jobPayRateDisplay
  }

  public jobIcon(jobCategory) {
    let nurses = ['RN', 'CNA', 'CDI', 'CMA', 'LPN', 'MA'];
    let providers = [
          'LABORATORY PROCESSING ASSISTANT',
          'LABORATORY DIRECTOR',
          'LABORATORY MANAGER',
          'OCCUPATIONAL THERAPIST',
          'PERFUSIONIST',
          'PHYSICAL THERAPIST',
          'PHYSICIAN',
          'SPEECH THERAPIST',
      ];
    let respiratory = ['CRT', 'RRT'];
    let behavioral = ['LCSW', 'LMSW'];
    let technicians = [
            'CST',
            'RVT',
            'LABORATORY TECHNICIAN',
            'LABORATORY TECHNOLOGIST',
            'MEDICAL TECHNICIAN',
            'PHLEBOTOMIST',
            'TECHNICIAN',
            'ENDOSCOPY TECHNICIAN',
            'STERILE PROCESSING TECHNICIAN',

            // TO VERIFY
            'INTERIM DIRECTOR'
          ];
    let category = jobCategory.toUpperCase().trim();
  
    let nurseResult = this.checkIcon(category, nurses);
    if (nurseResult) { return 'nurses' };
    
    let providersResult = this.checkIcon(category, providers);
    if (providersResult) { return 'providers' };
    
    let behavioralResult = this.checkIcon(category, behavioral);
    if (behavioralResult) { return 'behavioral' };

    let techniciansResult = this.checkIcon(category, technicians);
    if (techniciansResult) { return 'technicians' };
    
    let respiratoryResult = this.checkIcon(category, respiratory);
    if (respiratoryResult) { return 'respiratory' };
    
    console.log(category);
    return 'unlisted';
  }

  public checkIcon(category, categoryList) {
    let nurseResults = categoryList.filter( (category_data) => category_data === category );

    if (nurseResults.length) {
      return true;
    } else {
      return false;
    }
  }

  public getData(loadMore: boolean = false): void {
    this.start = loadMore ? (this.start + 30) : 0;
    this.titleService.setTitle(`${SettingsService.settings.companyName} - Careers`);
    let description: string = TranslateService.translate('PAGE_DESCRIPTION');
    this.meta.updateTag({ name: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'description', content: description });
    this.http.getjobs(this.filter, { start: this.start }).subscribe(this.onSuccess.bind(this), this.onFailure.bind(this));
  }

  public loadMore(): void {
    this.getData(true);
  }

  public openSidebar(): void {
    this.displaySidebar.emit(true);
  }

  public loadJob(jobId: number): void {
    this.router.navigate([`jobs/${jobId}`]);
    this.loading = true;
  }

  get loading(): boolean {
    return this._loading;
  }

  set loading(value: boolean) {
    this.showLoading.emit(value);
    this._loading = value;
  }

  private onSuccess(res: any): void {
    if (this.start > 0) {
      this.jobs = this.jobs.concat(res.data);
    } else {
      this.jobs = res.data;
    }
    this.total = res.total;
    this.moreAvailable = (res.count === 30);
  this.loading = false;
  }

  private onFailure(res: any): void {
    this.loading = false;
    this.jobs = [];
    this.total = 0;
    this.moreAvailable = false;
    this.showError.emit(true);
  }

}
