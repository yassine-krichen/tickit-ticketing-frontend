import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTipComponent } from './create-tip.component';

describe('CreateTipComponent', () => {
  let component: CreateTipComponent;
  let fixture: ComponentFixture<CreateTipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
