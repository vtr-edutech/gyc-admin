import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpTable } from './follow-up-table';

describe('FollowUpTable', () => {
  let component: FollowUpTable;
  let fixture: ComponentFixture<FollowUpTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUpTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowUpTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
