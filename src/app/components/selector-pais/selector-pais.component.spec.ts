import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorPaisComponent } from './selector-pais.component';

describe('SelectorPaisComponent', () => {
  let component: SelectorPaisComponent;
  let fixture: ComponentFixture<SelectorPaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorPaisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectorPaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
