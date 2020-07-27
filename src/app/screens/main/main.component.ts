import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { FacebookService, InitParams } from 'ngx-facebook';

declare var $: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  constructor(private facebookService: FacebookService) {
    console.log('\n\n\n\n\n\n', environment, '\n\n\n\n');
  }

  ngOnInit(): void {
    this.resetCaptcha();
    this.initFacebookService();
  
  }
  private initFacebookService(): void {
    const initParams: InitParams = { xfbml:true, version:'v3.2'};
    this.facebookService.init(initParams);
  }

  submitInquiry(): void {
    $('.form-group').removeClass('has-error');
    $('.help-block').remove();
    const formData = {
      fullName: $('#fullName').val(),
      contactNumber: $('#contactNumber').val(),
      bloodType: $('#bloodType').val(),
      nearestCity: $('#nearestCity').val(),
      captcha: $('#captcha').val(),
    };
    $.ajax({
      type: 'POST',
      url: `${environment.backend}/inquiry`,
      data: formData,
      dataType: 'json',
      encode: true,
    })
      .done((data) => {
        if (data.result === 'NOK') {
          if (data.errors.captcha) {
            this.resetCaptcha();
            $('#captcha-group').addClass('has-error');
            $('#captcha-group').append(
              '<div class="help-block">' + data.errors.captcha + '</div>'
            );
          }
          if (data.errors.fullName) {
            $('#fullName-group').addClass('has-error');
            $('#fullName-group').append(
              '<div class="help-block">' + data.errors.fullName + '</div>'
            );
          }
          if (data.errors.contactNumber) {
            $('#contactNumber-group').addClass('has-error');
            $('#contactNumber-group').append(
              '<div class="help-block">' + data.errors.contactNumber + '</div>'
            );
          }
        } else {
          $('#inquireForm').append(
            '<div class="alert alert-success">' + data.message + '</div>'
          );
        }
      })
      .fail((data) => {
        $('#inquireForm').append(
          '<div class="alert alert-success">' + JSON.stringify(data) + '</div>'
        );
      });
    event.preventDefault();
  }

  resetCaptcha(): void {
    const xhr = new XMLHttpRequest();
    xhr.open('get', `${environment.backend}/captcha`, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState != 4) return;
      const svg = xhr.responseXML.documentElement;
      $('#challenge').html(svg);
    };
    xhr.send();
  }
}
