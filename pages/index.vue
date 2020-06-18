<template>
  <div class="container">
    <div>
      <h1 class="title">
        Bug-mfa
      </h1>
      <div v-if="!user">
        <h2 class="subtitle">
          Login or register
        </h2>
        <input v-model="email" placeholder="email" />
        <input v-model="password" placeholder="password" />
        <button @click="register()">Register and login</button>
        <button @click="login()">Login</button>
      </div>
      <div v-if="mfaLogin">
        <h3>Login with 2 mfa factor:</h3>
        <input v-model="verificationCode" placeholder="verification code" />
        <button @click="acceptCode(true)">Accept code</button>
      </div>
      <div v-if="getHints">
        <ul v-for="(h, i) in getHints" :key="i">
          <li>{{ h.phoneNumber }}</li>
          <button @click="unenroll(h, i)">Delete hint</button>
        </ul>
      </div>
      <div v-if="user && !mfaLogin">
        <h2 class="subtitle">hi, {{ user.email }}</h2>
        <div>
          <h3>Register 2 mfa factors:</h3>
          <input v-model="phone" placeholder="phone" />
          <input v-model="verificationCode" placeholder="verification code" />
          <button @click="getSms()">Get sms</button>
          <button @click="acceptCode(false)">Accept code</button>
        </div>
      </div>
      <div id="recaptcha"></div>
    </div>
  </div>
</template>

<script>
import { fireDbauth, firebase } from '~/services/firebase.js'

export default {
  components: {},
  data() {
    return {
      user: null,
      email: '',
      password: '',
      mfaHints: [],
      phone: '',
      verificationId: '',
      verificationCode: '',
      mfaLogin: false
    }
  },
  computed: {
    getHints: {
      get() {
        return this.user ? this.user.multiFactor.b : []
      },
      set(v) {
        this.mfaHints = v
      }
    }
  },
  async mounted() {
    this.user = await fireDbauth.currentUser
    this.checkVerifiedEmail()
    console.warn('user: ', this.user)
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha',
      {
        size: 'invisible',
        callback(response) {
          // reCAPTCHA solved, you can proceed with phoneAuthProvider.verifyPhoneNumber(...).
          this.getSms()
        }
      }
    )
  },
  methods: {
    async register() {
      try {
        await fireDbauth.createUserWithEmailAndPassword(
          this.email,
          this.password
        )
        this.login()
      } catch (e) {
        console.log(e)
      }
    },
    async checkVerifiedEmail() {
      if (this.user) {
        if (this.user.emailVerified) {
          window.alert('good to go')
          this.getHints = this.user.multiFactor.b
        } else {
          window.alert('Please verify email for MFA bug test, link is sent')
          await fireDbauth.currentUser.sendEmailVerification()
        }
      } else {
        window.alert('Please login or register first')
      }
    },
    async login() {
      try {
        await fireDbauth.signInWithEmailAndPassword(this.email, this.password)
        this.user = await fireDbauth.currentUser
        this.getHints = this.user.multiFactor.b
        this.checkVerifiedEmail()
      } catch (e) {
        if (e.code === 'auth/multi-factor-auth-required') {
          this.mfaLogin = true
          window.resolver = e.resolver
          this.getSms(e.resolver)
        }
      }
    },
    async getSms(resolver) {
      window.alert('get sms')
      console.log('phone', this.phone)
      let phoneInfoOptions = ''
      if (resolver) {
        phoneInfoOptions = {
          multiFactorHint: resolver.hints[0],
          session: await resolver.session
        }
      } else {
        phoneInfoOptions = {
          phoneNumber: this.phone,
          session: await this.user.multiFactor.getSession()
        }
      }
      const phoneAuthProvider = new firebase.auth.PhoneAuthProvider()
      // Send SMS verification code.

      this.verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        window.recaptchaVerifier
      )
      window.alert(
        resolver ? 'sms sent write code to authenticate with MFA' : 'sms sent'
      )
      // verificationId will be needed for enrollment completion.
    },
    async acceptCode(mfaLogin) {
      const cred = firebase.auth.PhoneAuthProvider.credential(
        this.verificationId,
        this.verificationCode
      )
      const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(
        cred
      )
      if (mfaLogin) {
        window.resolver.resolveSignIn(multiFactorAssertion)
        window.alert('done authenticated with mfa')
        this.mfaLogin = false
        this.user = await fireDbauth.currentUser
        console.log(this.user)
        this.getHints = this.user.multiFactor.b
      } else {
        this.user.multiFactor.enroll(multiFactorAssertion)
        this.getHints = this.user.multiFactor.b
        window.alert('done enrolled')
      }
    },
    unenroll(h, i) {
      // Ask user to select from the enrolled options.
      return this.user.multiFactor.unenroll(h).then(() => {
        // User successfully unenrolled selected factor.
        window.alert('removed mfa')
        this.getHints = this.user.multiFactor.b
      })
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}
</style>
