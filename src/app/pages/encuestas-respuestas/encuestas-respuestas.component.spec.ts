import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncuestasRespuestasComponent } from './encuestas-respuestas.component';

describe('EncuestasRespuestasComponent', () => {
  let component: EncuestasRespuestasComponent;
  let fixture: ComponentFixture<EncuestasRespuestasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncuestasRespuestasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EncuestasRespuestasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
