import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpForm } from './follow-up-form';

describe('FollowUpForm', () => {
  let component: FollowUpForm;
  let fixture: ComponentFixture<FollowUpForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUpForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowUpForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
