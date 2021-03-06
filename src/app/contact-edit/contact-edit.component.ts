import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContactsService } from '../services/contacts.service';
import { NotifyService } from '../core/notify.service';

@Component({
  selector: 'appdashboard-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.scss']
})
export class ContactEditComponent implements OnInit {
  @ViewChild('editleadbtn') private edit_lead_btn_ref: ElementRef;
  lead_id: string;
  lead_fullname: string;
  lead_email: string;

  lead_fullnameCurrentValue: string;
  lead_emailCurrentValue: string;

  EMAIL_IS_VALID = true;
  HAS_EDIT_FULLNAME = false;
  HAS_EDIT_EMAIL = false;

  constructor(
    public location: Location,
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private notify: NotifyService
  ) { }

  ngOnInit() {

    this.getRequesterIdParam();
  }

  getRequesterIdParam() {
    this.lead_id = this.route.snapshot.params['requesterid'];
    console.log('!!!!! EDIT CONTACT - REQUESTER ID ', this.lead_id);

    if (this.lead_id) {
      this.getContactById();
    }
  }

  getContactById() {
    this.contactsService.getLeadById(this.lead_id)
      .subscribe((lead: any) => {

        if (lead) {
          console.log('!!!!! EDIT CONTACT - GET LEAD BY ID ', lead);
          this.lead_fullname = lead.fullname;
          this.lead_email = lead.email;
          this.lead_fullnameCurrentValue = lead.fullname;
          this.lead_emailCurrentValue = lead.email;
        }


      }, (error) => {

        console.log('!!!!! EDIT CONTACT  - GET LEAD BY REQUESTER ID - ERROR ', error);

      }, () => {
        console.log('!!!!! EDIT CONTACT  - GET LEAD BY REQUESTER ID * COMPLETE *');
      });

  }

  editContact() {
    this.HAS_EDIT_FULLNAME = false;
    this.HAS_EDIT_EMAIL = false;
    this.EMAIL_IS_VALID = true;
    this.edit_lead_btn_ref.nativeElement.blur();

    this.contactsService.updateLead(this.lead_id, this.lead_fullname, this.lead_email)
      .subscribe((contact) => {
        console.log('!!!!! EDIT CONTACT - UPDATED CONTACT ', contact);

      }, (error) => {

        console.log('!!!!! EDIT CONTACT - UPDATE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem')

      }, () => {
        console.log('!!!!! EDIT CONTACT - UPDATE CONTACT * COMPLETE *');

        // =========== NOTIFY SUCCESS===========
        this.notify.showNotification('Contact successfully updated', 2, 'done');


      });
  }

  fullnameChange(event) {
    console.log('!!!!! EDIT CONTACT - EDITING FULLNAME ', event);
    console.log('!!!!! EDIT CONTACT - EDITING FULLNAME CURRENT VALUE ', this.lead_fullnameCurrentValue);
    if (event === this.lead_fullnameCurrentValue) {
      this.HAS_EDIT_FULLNAME = false;
    } else {
      this.HAS_EDIT_FULLNAME = true;
    }
  }

  emailChange(event) {
    console.log('!!!!! EDIT CONTACT - EDITING EMAIL ', event);

    if (event === this.lead_emailCurrentValue) {
      this.HAS_EDIT_EMAIL = false;
    } else {
      this.HAS_EDIT_EMAIL = true;

    }

    this.EMAIL_IS_VALID = this.validateEmail(event)
    console.log('!!!!! EDIT CONTACT - EMAIL IS VALID ', this.EMAIL_IS_VALID);
  }

  validateEmail(email) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }


  goBack() {
    this.location.back();

  }

}
