import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConectaCuatroComponent } from './conecta-cuatro.component';

describe('ConectaCuatroComponent', () => {
  let component: ConectaCuatroComponent;
  let fixture: ComponentFixture<ConectaCuatroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConectaCuatroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConectaCuatroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
