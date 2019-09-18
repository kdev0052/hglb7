// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file.

const Apify = require('apify');
const puppeteer = require('puppeteer')
const fs = require('fs');
const gen = require('./generators/allGenerators.js')
const tempMail = require('./email/temp-mail.js')
const dao = require('./dao/dao.js')

Apify.main(async () => {

 ////////PREVENT DETECTION/////////////
       
const solveV2Captcha = async function (url, optBrowser, optPage, secondRun) {
  let browser
  if(optBrowser != undefined) {
    browser = optBrowser
  } else {
    browser = await puppeteer.launch({
          	headless: true,
           args: ADDITIONAL_CHROME_FLAGS
        })
  }
  
  let page
    if(optPage != undefined) {
    page = optPage
  } else {
    page = await browser.newPage()
    await evadeChromeHeadlessDetection(page)
    await page.goto(url)
    await page.waitFor(1000)
  }
  
   
    const ibmPromise = initIbmPage(browser,"recaptcha")
    await randomMouseMove(page);
    const anchorFrame = await retrieveCaptchaFrame(page, "anchor")
    
    if(anchorFrame == undefined)  {
      console.log("NO CAPTCHA FOUND")
      return {browser, page}
    }

  console.log("Screenshot 00 for run", (secondRun ? "2" : "1"),)
    const screenshotBuffer00 = await page.screenshot();
    await Apify.setValue("00"+ (secondRun ? "-2" : ""), screenshotBuffer00, { contentType: 'image/png' });
    

    const bFrame0 = await retrieveCaptchaFrame(page, "bframe", 0)
    if(!secondRun) {
        const checkbox = await anchorFrame.$(".recaptcha-checkbox-border")
        await targetedMouseMove(page, checkbox);
        await checkbox.click()
        await page.waitFor(2000)
        const alreadyOk = await anchorFrame.evaluate(() => document.querySelector("#recaptcha-anchor").getAttribute("aria-checked")=="true")
        if(alreadyOk) {
            console.log("AlreadyOk")
            return {browser, page}
        }
        await bFrame0.click("#recaptcha-audio-button")
        await page.waitFor(600)
    }
    const bFrame1 = await retrieveCaptchaFrame(page, "bframe", 1)
      console.log("Screenshot DBG for run", (secondRun ? "2" : "1"),)
    const screenshotBufferDBG = await page.screenshot();
    await Apify.setValue("DBG"+ (secondRun ? "-2" : ""), screenshotBufferDBG, { contentType: 'image/png' });
   
 
    const audioUrl = await bFrame0.evaluate(() => document.querySelector(".rc-audiochallenge-tdownload-link").href)
    console.log("audioUrl : ", audioUrl)
    let byteString = await bFrame1.evaluate(
        async () => {
            return new Promise(async resolve => {
                const reader = new FileReader();
                let audioUrl = document.querySelector(".rc-audiochallenge-tdownload-link").href;
                let data =  await fetch(audioUrl).then(
                function(response) {
                    return response.blob()
                }
                )
                reader.readAsBinaryString(data);
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => console.log('Error occurred while reading binary string');
            });
        }
    )
    let byteData  = Buffer.from(byteString, 'binary');

    let filePath = "test.mp3"
    fs.writeFile(filePath, byteData,  "binary", (err) => null);
     const result =  await resolveAndValidate(filePath, "recaptcha", ibmPromise)
     console.log("RESULT", result)
    await bFrame1.type("#audio-response", result);

    console.log("Screenshot A1 for run", (secondRun ? "2" : "1"),)
    const screenshotBufferA1 = await page.screenshot();
    await Apify.setValue("A1"+ (secondRun ? "-2" : ""), screenshotBufferA1, { contentType: 'image/png' });
    
    await page.waitFor(200);
    await bFrame1.click("#recaptcha-verify-button")
    await page.waitFor(1200);

    const w0 = await anchorFrame.evaluate(() => document.querySelector("#recaptcha-anchor") && document.querySelector("#recaptcha-anchor").getAttribute("aria-checked")=="true")
    const w1=  w0 || await bFrame0.evaluate(() => document.querySelector("#recaptcha-anchor") && document.querySelector("#recaptcha-anchor").getAttribute("aria-checked")=="true")
    const w2= w1 || await bFrame1.evaluate(() => document.querySelector("#recaptcha-anchor") && document.querySelector("#recaptcha-anchor").getAttribute("aria-checked")=="true")
    const worked = w0 || w1 || w2 //todo no need to do the 3 if the first is o
    
    console.log("Screenshot A2 for run", (secondRun ? "2" : "1"),)
    const screenshotBufferA2 = await page.screenshot();
    await Apify.setValue("A2"+ (secondRun ? "-2" : ""), screenshotBufferA2, { contentType: 'image/png' });
    
    if(worked == null && !secondRun) {
        //need to resolve one more
        console.log("NEED ANOTHER TRY")
        console.log("Screenshot NEED_NEW_TRY")
        const screenshotBufferNNT = await page.screenshot();
        await Apify.setValue("NEED_NEW_TRY", screenshotBufferNNT, { contentType: 'image/png' });
            
        await bFrame1.click("#recaptcha-reload-button")
        await(solveV2Captcha(url,browser, page, true))
    }

    
     console.log("Screenshot WRK - Cpathca should be solved ?", worked)
     const screenshotBufferWRK = await page.screenshot();
     await Apify.setValue("WRK", screenshotBufferWRK, { contentType: 'image/png' });
            
    console.log("worked ? :",worked)
    
    return {
      "browser": browser,
      "page" : page,
      "isSuccess" : worked //TODO
    } 
}



///////////////////////////
 async function evadeChromeHeadlessDetection(page) {
    // Pass the Webdriver Test.
    await page.evaluateOnNewDocument(() => {
        const newProto = navigator.__proto__;
        delete newProto.webdriver;
        navigator.__proto__ = newProto;
    });

    // Pass the Chrome Test.
    await page.evaluateOnNewDocument(() => {
        // We can mock this in as much depth as we need for the test.
        const mockObj = {
            app: {
                isInstalled: false,
            },
            webstore: {
                onInstallStageChanged: {},
                onDownloadProgress: {},
            },
            runtime: {
                PlatformOs: {
                    MAC: 'mac',
                    WIN: 'win',
                    ANDROID: 'android',
                    CROS: 'cros',
                    LINUX: 'linux',
                    OPENBSD: 'openbsd',
                },
                PlatformArch: {
                    ARM: 'arm',
                    X86_32: 'x86-32',
                    X86_64: 'x86-64',
                },
                PlatformNaclArch: {
                    ARM: 'arm',
                    X86_32: 'x86-32',
                    X86_64: 'x86-64',
                },
                RequestUpdateCheckStatus: {
                    THROTTLED: 'throttled',
                    NO_UPDATE: 'no_update',
                    UPDATE_AVAILABLE: 'update_available',
                },
                OnInstalledReason: {
                    INSTALL: 'install',
                    UPDATE: 'update',
                    CHROME_UPDATE: 'chrome_update',
                    SHARED_MODULE_UPDATE: 'shared_module_update',
                },
                OnRestartRequiredReason: {
                    APP_UPDATE: 'app_update',
                    OS_UPDATE: 'os_update',
                    PERIODIC: 'periodic',
                },
            },
        };

        window.navigator.chrome = mockObj;
        window.chrome = mockObj;
    });
}

var ADDITIONAL_CHROME_FLAGS = [
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920x1080',
    '--hide-scrollbars'
];



/////////////////////////////////////////////////////
////////////////////IMPORTS START////////////////////
/////////////////////////////////////////////////////
const randomMouseMove = async function(anypage) {
  let x = Math.floor(Math.random() * 600)
  let y = Math.floor(Math.random() * 600)
  await anypage.waitFor(Math.floor(Math.random() * 200))
 await anypage.mouse.move(x, y); 
  await anypage.waitFor(Math.floor(Math.random() * 200))
}
const targetedMouseMove = async function(anypage, el) {
  const bbox = await el.boundingBox();
  const x = bbox.x + bbox.width / 2;
  const y = bbox.y + bbox.height / 2;
    await anypage.waitFor(Math.floor(Math.random() * 200))
  await anypage.mouse.move(x, y); 
    await anypage.waitFor(Math.floor(Math.random() * 200))
}
const initIbmPage = async function(browser, captchaType) {
    let ibmPage = await browser.newPage()
    await ibmPage.goto("https://speech-to-text-demo.ng.bluemix.net/")
    if(captchaType == "octocaptcha") {
     await ibmPage.select('#root > div > div.flex.setup > div:nth-child(1) > p:nth-child(1) > select', 'en-US_ShortForm_NarrowbandModel')
     await ibmPage.click('#keywords',{ clickCount: 3 })
     await ibmPage.type('#keywords', 'one,two,three,four,five,six,seven,eight,nine,ten,zero')
    } else if (captchaType == "recaptcha") {
    //do nothing, selected by default
    // await ibmPage.select('#root > div > div.flex.setup > div:nth-child(1) > p:nth-child(1) > select', 'en-US_ShortForm_NarrowbandModel')

    }
    await ibmPage.evaluate(() => {
        document.querySelector("#speaker-labels").click()
    }) 
  return ibmPage
}
const isValid = function(captchaType, str) {
  if(captchaType == "octocaptcha") {
    return /^[0-9]+$/.test(str)
  } else {
     return str.length>4
  }
}
const resolveAndValidate = async function(filePath0, captchaType, ibmPromise) {
  const solveCaptcha = async function(filePath) {
    console.log("CALLING IBM")
    const ibmPage = await ibmPromise
    const input = await ibmPage.$('#root > div > input[type=file]');
    await input.uploadFile(filePath);
    await ibmPage.waitFor(6000)
    /*await ibmPage.screenshot({
        path: 'ibm.png',
        fullPage: true
    })*/
    return  ibmPage.evaluate(() => document.querySelector("#root > div > div.tab-panels > div > div > div").textContent.split(".").map(s => s.trim()).join(""))
}

let solvedCaptcha = await solveCaptcha(filePath0) //TODO try multiple in parallel, and keep the one with the good number of numbers
  console.log("Solved captcha = "+solvedCaptcha);
  if(!isValid(captchaType, solvedCaptcha)) {
        console.log("solved captcha is invalid. Retrying")
       solvedCaptcha = await solveCaptcha(filePath0)
        console.log("Solved captcha = "+solvedCaptcha);
  }

  return solvedCaptcha;
}
/////////////////////////////////////////////////////
/////////////////////IMPORTS END/////////////////////
/////////////////////////////////////////////////////
const retrieveCaptchaFrame = async function(page, part, idx) {
  let captchaFrame
  let i = 0
  for (const frame of page.mainFrame().childFrames()){
    //CAPTCHA V2 ONLY TODO
   //   console.log("found frame : ",frame.url())
      if (frame.url().includes('recaptcha/api2/'+part)){
        console.log("found recaptcha frame : ",part)
 
        i = i+1;
        captchaFrame = frame
      }
  }

  return captchaFrame
}

const res =  await solveV2Captcha("https://gitlab.com/users/sign_in#register-pane")
console.log("gen", gen)
const user = {
    firstName: gen.firstName(),
    lastName: gen.lastName(),
    userName: gen.userName(),
    password: gen.password(),
    email : tempMail.getAddress(gen.userName().toLowerCase())
}
console.log("USER : ", user)

await res.page.type("#new_user_name", user.firstName + " " + user.lastName)
await res.page.type("#new_user_email", user.email)
await res.page.type("#new_user_email_confirmation", user.email)
await res.page.type("#new_user_password", user.password)
await res.page.type("#new_user_username", user.userName)

await res.page.click("#terms_opt_in")

 console.log("Screenshot USR - Captcha already solved, user data just written")
const screenshotBufferUSR = await res.page.screenshot();
await Apify.setValue("USR", screenshotBufferUSR, { contentType: 'image/png' });
            
    
await res.page.waitFor(200)
await res.page.click("#new_new_user > div.submit-container > input")
await res.page.waitFor(1000)


 console.log("Screenshot PST_SIGNUP - Signup button clicked")
const screenshotBufferPST_SIGNUP = await res.page.screenshot();
await Apify.setValue("PST_SIGNUP", screenshotBufferPST_SIGNUP, { contentType: 'image/png' });
  
let worked = await res.page.evaluate(() => document.querySelector("#new_new_user") == undefined)
console.log("1st try worked ? ", worked)

if(worked) {
    try {
        await tempMail.validateEmail(user.email, res.browser)
        console.log("Completed email validation ")
    } catch (err) {
        console.log("ERROR WHILE VALIDATING EMAIL : ", err)
        return;
    }
   
} else return;

await res.page.goto("https://gitlab.com/users/sign_in#login-pane")
await res.page.waitFor(600)

await res.page.type("#user_login", user.email)
await res.page.type("#user_password", user.password)
await res.page.click("#new_user > div.submit-container.move-submit-down > input")

await res.page.waitFor(500)

await res.page.goto("https://gitlab.com/profile/personal_access_tokens")
await res.page.waitFor(1000)

await res.page.type("#personal_access_token_name", user.userName.substring(0,6))

await res.page.type("#personal_access_token_expires_at", "203"+Math.floor(Math.random()*10)+"-01-0"+Math.floor(Math.random()*8+1))

await res.page.evaluate(() =>
document.querySelectorAll(".form-group input[type=checkbox]").forEach(s => s.click())
)
await res.page.waitFor(200)
await res.page.click(".qa-create-token-button")
await res.page.waitFor(1500)

 console.log("Screenshot TOKEN - Signup button clicked")
const screenshotBufferTOKEN = await res.page.screenshot();
await Apify.setValue("TOKEN", screenshotBufferTOKEN, { contentType: 'image/png' });
  

const gitlabToken = await res.page.evaluate(() =>
        document.querySelector("#created-personal-access-token").value
    )

console.log("GITLABTOKEN", gitlabToken)

//NOW ZEIT.CO AND OTHER SERVICES
await res.page.goto("https://zeit.co/signup")
await res.page.waitFor(1000)
await res.page.click(".gitlab-form > button")
await res.page.waitFor(3500)
await res.page.click("input.btn.btn-success")
await res.page.waitFor(5000)
await res.page.click(".footer-menu button")
await res.page.waitFor(5000)
await res.page.click(".footer-menu button")
await res.page.waitFor(500)
await res.page.goto("https://zeit.co/account/tokens")
await res.page.waitFor(2000)
await res.page.click(".menu > div.actions > button.button.small.icon-color:not(.disabled)")
await res.page.waitFor(1000)
await res.page.type("div.focus-trap input", "token1")
await res.page.click("footer > button:nth-child(2)")
await res.page.waitFor(1000)
const zeitToken = await res.page.evaluate(() => document.querySelector("div.focus-trap  input").value)
console.log("zeitToken", zeitToken)

const appData = {
    zeit: zeitToken
}
console.log("SAVING 101");
await dao.save(user, "gitlab", "global", appData, gitlabToken)
console.log("SAVED");
await res.browser.close()

});
