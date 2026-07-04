import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TneaSuggestions } from './tnea-suggestions';

describe('TneaSuggestions', () => {
  let component: TneaSuggestions;
  let fixture: ComponentFixture<TneaSuggestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TneaSuggestions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TneaSuggestions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
