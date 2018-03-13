import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { NotifyService } from './notify.service';

import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { mergeMap } from 'rxjs/operators/mergeMap';

interface User {
  uid: string;
  email?: string | null;
  photoURL?: string;
  displayName?: string;
  time: number;
}

// start SUPER USER
export class SuperUser {
  constructor(
    public email: string // FOR SUPERUSER
  ) { }
}

const superusers = [
  new SuperUser('andrea.sponziello21@frontiere21.it'),
  new SuperUser('nicola.lanzilotto@frontiere21.it'),
  new SuperUser('lanzilottonicola74@gmail.com'),
];

// .end SUPER USER


@Injectable()
export class AuthService {
  http: Http;
  MONGODB_BASE_URL = environment.mongoDbConfig.MONGODB_SIGNUP_BASE_URL;
  MONGODB_PEOPLE_BASE_URL = environment.mongoDbConfig.MONGODB_PEOPLE_BASE_URL;
  TOKEN = environment.mongoDbConfig.TOKEN;

  displayName?: string;
  user: Observable<User | null>;

  constructor(
    http: Http,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private notify: NotifyService) {

    this.http = http;

    this.user = this.afAuth.authState
      .switchMap((user) => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return Observable.of(null);
        }
      });
  }

  /**
  *  //// Email/Password MONGODB Auth //// CREATE (POST)
  * @param fullName
  */
  public mDbEmailSignUp(email: string, password: string, first_name: string, last_name: string): Observable<any> {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    // headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // const optionsp = new RequestOptions({ headers });

    const body = { 'email': email, 'password': password, 'firstname': first_name, 'lastname': last_name };
    // const bodyperson = { 'firstname': `${first_name}`, 'lastname': `${last_name}` };

    console.log('SIGNUP POST REQUEST BODY ', body);

    const url = this.MONGODB_BASE_URL;
    const personurl = this.MONGODB_PEOPLE_BASE_URL;
    console.log('SIGNUP URL ', url)
    console.log('PEOPLE URL ', personurl)

    return this.http
      .post(url, JSON.stringify(body), options)
      .map(res => {
        // tslint:disable-next-line:no-debugger
        // debugger
        console.log('res: ', res.json())
        return res.json()
      })
      // .pipe(mergeMap(e => {
      //   console.log('e: ', e)
      //   return this.http.post(personurl, JSON.stringify(bodyperson), options)
      //   .map((res) => {res.json()})
      // }))
    // .map((res) => {res.json()})))


  }

  ////// SUPER USER AUTH //////
  superUserAuth(currentUserEmailgetFromStorage) {
    const authenticatedSuperUser = superusers.find(u => u.email === currentUserEmailgetFromStorage);
    if (authenticatedSuperUser && authenticatedSuperUser.email === currentUserEmailgetFromStorage) {
      // console.log('AUTENTICATED SUPER USER ', authenticatedUser)
      // console.log('AUTENTICATED SUPER USER EMAIL ', authenticatedUser.email)
      // console.log('AUTH SERVICE C. USER EMAIL ', authenticatedUser.email)
      return true;
    }
    return false;
  }

  ////// OAuth Methods /////

  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  githubLogin() {
    const provider = new firebase.auth.GithubAuthProvider();
    return this.oAuthLogin(provider);
  }

  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  twitterLogin() {
    const provider = new firebase.auth.TwitterAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider: firebase.auth.AuthProvider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.notify.update('Welcome to Chat21 dashboard!!!', 'success');
        return this.updateUserData(credential.user);
      })
      .catch((error) => this.handleError(error));
  }

  //// Anonymous Auth ////

  anonymousLogin() {
    return this.afAuth.auth.signInAnonymously()
      .then((user) => {
        this.notify.update('Welcome to Firestarter!!!', 'success');
        return this.updateUserData(user); // if using firestore
      })
      .catch((error) => {
        console.error(error.code);
        console.error(error.message);
        this.handleError(error);
      });
  }



  //// Email/Password Auth //// NO MORE USED see ABOVE mDbEmailSignUp
  emailSignUp(email: string, password: string, displayName: string) {
    console.log('x USER display name ', displayName);
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        console.log('x USER ', user);
        console.log('x USER email ', user.email);
        console.log('x USER psw ', user.password);
        // user.displayName = displayName;
        // user.updateProfile({ 'displayName': displayName });
        this.displayName = displayName;
        this.notify.update('Welcome to Chat21 dashboard!!!', 'success');
        this.router.navigate(['/']);
        return this.updateUserData(user); // if using firestore
      })
      .catch((error) => this.handleError(error));
  }
  // emailSignUpWithDisplayName(email: string, password: string, displayName: string) {
  //     return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
  //      .then((user) => {
  //         // Add a display name to the user.
  //      user.updateProfile({ 'displayName': displayName }).then(() => {
  //       // Update successful
  //         this.authState = user
  //       });
  //         this.updateUserData()
  //       })
  //       .catch(error =>{
  //         console.log(error);
  //         // THrow the exception which results when user signsup
  //          throw(error);
  //         });
  //   }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        console.log('LOGGED USER ', user);
        this.notify.update('Welcome to Chat21 dashboard!!!', 'success');
        this.router.navigate(['/']);
        return this.updateUserDataLogin(user); // if using firestore
      })
      .catch((error) => {
        this.handleError(error);
        console.log('xx ', error);
      });

  }

  // Sends email allowing user to reset password
  resetPassword(email: string) {
    const fbAuth = firebase.auth();

    return fbAuth.sendPasswordResetEmail(email)
      .then(() => this.notify.update('Password update email sent', 'info'))
      .catch((error) => this.handleError(error));
  }

  signOut() {
    // this.afAuth.auth.signOut().then(() => {
    firebase.auth().signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  // If error, console log and notify user
  private handleError(error: Error) {
    console.error(error);
    this.notify.update(error.message, 'error');
  }

  // Sets user data to firestore after succesful login
  private updateUserData(user: User) {

    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    const data: User = {
      uid: user.uid,
      email: user.email || null,
      displayName: this.displayName || 'nameless user',
      photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
      time: new Date().getTime(),
    };
    return userRef.set(data);
  }

  // Sets user data to firestore after succesful login
  private updateUserDataLogin(user: User) {

    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    const data: User = {
      uid: user.uid,
      email: user.email || null,
      photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
      time: new Date().getTime(),
    };
    return userRef.set(data);
  }
}
