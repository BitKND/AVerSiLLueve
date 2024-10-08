import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  user:any;

  constructor(
    public authService:AuthenticationService,
    public route: Router,
    
  ) {
    this.user = authService.getProfile();
  }

  async logout(){
    this.authService.signOut().then(()=>{
      this.route.navigate(['/sign-in'])
    }).catch((error)=>{
      console.log(error);
    })
  }

}
