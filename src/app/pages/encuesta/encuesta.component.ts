import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EncuestaService } from 'app/shared/services/encuesta/encuesta.service';
import { atLeastOneCheckboxChecked } from 'app/validators/at-least-one-checkbox-checked';
import { CheckboxGroupManager } from 'app/helpers/CheckboxGroupManager';
import { numbersOnlyValidator } from 'app/validators/only-number';
import Swal from 'sweetalert2';
import { SelectorPaisComponent } from "../../components/selector-pais/selector-pais.component";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { continentsNames } from 'app/components/selector-pais/continentsNames';
import { hasCode3 } from 'app/validators/hasCode3';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectorPaisComponent, HttpClientModule],
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.scss'
})
export class EncuestaComponent {
  surveyForm: FormGroup;
  checkboxManager!: CheckboxGroupManager;

  encuestaService: EncuestaService = inject(EncuestaService);
  router: Router = inject(Router);

  phonePattern= {
    pattern: '',
    errorMessage: ''
  }

  admmitedContinents = [continentsNames.AmericaDelNorte, continentsNames.AmericaDelSur, continentsNames.Europa];

  constructor(private fb: FormBuilder) {
    this.surveyForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      phoneNumber: ['', [Validators.required, numbersOnlyValidator(), Validators.maxLength(10)]],
      deportes: this.fb.group<any>({
        tenis: [false],
        futbol: [false],
        basquet: [false],
        voley: [false],
        otros: [false],
      }, { validators: [atLeastOneCheckboxChecked]}),
      estacion: ['', Validators.required],
      pasatiempos: ['', Validators.required],
      nacionalidad: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const deportesGroup = this.surveyForm.get('deportes') as FormGroup;
    this.checkboxManager = new CheckboxGroupManager(deportesGroup, [['tenis', 'futbol', 'basquet', 'voley'], ['otros']]);
  }

  async onSubmit() {
    try{
    if (this.surveyForm.valid) {
        await this.encuestaService.guardarEncuesta(this.surveyForm.value);
        Swal.fire('Gracias!',
          'Has cargado y enviado la encuesta correctamente',
          'success'
        );

      } else {
        Swal.fire('Error!',
          'El formulario contiene datos no validos',
          'error'
        );
      }
    }
    catch{

      Swal.fire('Error!',
        'Error al cargar la encuesta',
        'error'
      );
    }

    this.surveyForm.reset();
  }

  goEncuestasRespuestas = () => this.router.navigate(['/encuestas-respuestas']);

}
