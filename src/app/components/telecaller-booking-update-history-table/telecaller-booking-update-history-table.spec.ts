import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelecallerBookingUpdateHistoryTable } from './telecaller-booking-update-history-table';

describe('TelecallerBookingUpdateHistoryTable', () => {
  let component: TelecallerBookingUpdateHistoryTable;
  let fixture: ComponentFixture<TelecallerBookingUpdateHistoryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelecallerBookingUpdateHistoryTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TelecallerBookingUpdateHistoryTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
