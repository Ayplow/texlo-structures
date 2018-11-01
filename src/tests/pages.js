module.exports = {
  authorized: user => `<head>
  <link rel="icon" href="https://discordapp.com/assets/07dca80a102d4149e9736d4b162cff6f.ico">
  <title>Authorized</title>
  <style>
    #oauth2-message {
      -ms-flex-align: center;
      -ms-flex-direction: column;
      -ms-flex-pack: center;
      -webkit-box-align: center;
      -webkit-box-direction: normal;
      -webkit-box-orient: vertical;
      -webkit-box-pack: center;
      align-items: center;
      background-color: #282b30;
      bottom: 0;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      flex-direction: column;
      justify-content: center;
      left: 0;
      padding: 20px;
      position: absolute;
      right: 0;
      top: 0
    }

    #oauth2-message .oauth2-message-icon {
      background-position: 50%;
      background-repeat: no-repeat;
      display: inline-block
    }

    #oauth2-message .oauth2-message-icon-x {
      background-image: url("https://discordapp.com/assets/cb022a13e6d1ccbfdc832dbf2d23026a.svg");
      background-size: 92px 92px;
      height: 92px;
      width: 92px
    }

    #oauth2-message .oauth2-message-icon-check {
      background-image: url("https://discordapp.com/assets/d2d5349e18523c06528f5a5c5665f804.svg");
      background-size: 158px 130px;
      height: 130px;
      width: 158px
    }

    #oauth2-message .oauth2-message-text {
      color: #fff;
      font-size: 18px;
      line-height: 22px;
      margin-top: 26px
    }

    #oauth2-message .oauth2-message-text strong {
      font-weight: 700
    }

    #oauth2-message .oauth2-message-subtext {
      color: hsla(0, 0%, 100%, .4);
      font-size: 12px;
      line-height: 22px
    }

    #oauth2-authorize {
      -ms-flex-align: center;
      -ms-flex-pack: center;
      -webkit-box-align: center;
      -webkit-box-pack: center;
      align-items: center;
      background-color: #282b30;
      bottom: 0;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      justify-content: center;
      left: 0;
      overflow: auto;
      position: absolute;
      right: 0;
      top: 0
    }

    #oauth2-authorize .authorize-inner {
      -ms-flex-direction: column;
      -webkit-box-direction: normal;
      -webkit-box-orient: vertical;
      -webkit-box-shadow: 0 1px 10px 0 rgba(0, 0, 0, .1);
      background: #35383c;
      border-radius: 5px;
      box-shadow: 0 1px 10px 0 rgba(0, 0, 0, .1);
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      flex-direction: column;
      position: relative;
      width: 500px
    }

    #oauth2-authorize .authorize-inner:before {
      background: url("https://discordapp.com/assets/5c5bb53489a0a9f602df0a24c5981523.svg") 50% no-repeat;
      content: " ";
      height: 46px;
      left: 0;
      opacity: .2;
      position: absolute;
      top: -86px;
      width: 40px;
      width: 100%
    }

    #oauth2-authorize .authorize-inner .scroller-wrap {
      max-height: calc(100vh - 500px);
      overflow: hidden;
    }

    #oauth2-authorize .authorize-inner header {
      -ms-flex-align: center;
      -webkit-box-align: center;
      -webkit-box-shadow: 0 2px 8px 0 rgba(0, 0, 0, .06);
      -webkit-box-sizing: border-box;
      align-items: center;
      background: #7289da;
      border-radius: 5px 5px 0 0;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, .06);
      box-sizing: border-box;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      height: 140px;
      padding: 24px
    }

    #oauth2-authorize .authorize-inner header .application-name {
      -ms-flex: 1;
      -webkit-box-flex: 1;
      flex: 1;
      overflow: hidden
    }

    #oauth2-authorize .authorize-inner header .application-name>:first-child {
      color: hsla(0, 0%, 100%, .4);
      font-size: 16px;
      font-weight: 500;
      line-height: 16px;
      text-transform: uppercase
    }

    #oauth2-authorize .authorize-inner header .application-name>:last-child {
      color: #fff;
      font-size: 48px;
      font-weight: 700;
      line-height: 56px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap
    }

    #oauth2-authorize .authorize-inner header .application-icon {
      -ms-flex-align: center;
      -ms-flex-pack: center;
      -webkit-box-align: center;
      -webkit-box-pack: center;
      align-items: center;
      background: hsla(0, 0%, 100%, .2);
      border-radius: 46px;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      height: 92px;
      justify-content: center;
      margin-left: 30px;
      width: 92px
    }

    #oauth2-authorize .authorize-inner header .application-icon .application-icon-inner {
      background: url("https://discordapp.com/assets/1afb8f8e80a200ef3aa11131c0c07934.png") 50% no-repeat;
      background-size: 92px;
      border-radius: 40px;
      height: 80px;
      width: 80px
    }

    #oauth2-authorize .authorize-inner .captcha {
      -ms-flex-align: center;
      -ms-flex-direction: column;
      -ms-flex-pack: center;
      -webkit-box-align: center;
      -webkit-box-direction: normal;
      -webkit-box-orient: vertical;
      -webkit-box-pack: center;
      align-items: center;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-bottom: 30px;
      padding-left: 30px;
      padding-top: 30px
    }

    #oauth2-authorize .authorize-inner .captcha .recaptcha {
      height: 78px
    }

    #oauth2-authorize .authorize-inner .scopes {
      padding-bottom: 30px;
      padding-left: 30px;
      padding-top: 30px
    }

    #oauth2-authorize .authorize-inner .scopes label {
      color: hsla(0, 0%, 100%, .2);
      font-size: 11px;
      font-weight: 700;
      line-height: 15px;
      text-transform: uppercase
    }

    #oauth2-authorize .authorize-inner .scopes .scope {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex
    }

    #oauth2-authorize .authorize-inner .scopes .scope .scope-check {
      -webkit-box-sizing: border-box;
      background: hsla(0, 0%, 100%, .2);
      border-radius: 18px;
      box-sizing: border-box;
      height: 36px;
      margin-right: 20px;
      margin-top: 14px;
      padding: 2px;
      width: 36px
    }

    #oauth2-authorize .authorize-inner .scopes .scope .scope-check .scope-check-inner {
      -webkit-box-sizing: border-box;
      background-color: #747f8d;
      background-image: url("https://discordapp.com/assets/eb7df431c75a876011cf8a271e42ef67.svg");
      background-position: 50%;
      background-repeat: no-repeat;
      background-size: 17px 13px;
      border: 2px solid #35383c;
      border-radius: 16px;
      box-sizing: border-box;
      height: 32px;
      width: 32px
    }

    #oauth2-authorize .authorize-inner .scopes .scope .scope-inner {
      -ms-flex: 1;
      -ms-flex-direction: column;
      -ms-flex-pack: center;
      -webkit-box-direction: normal;
      -webkit-box-flex: 1;
      -webkit-box-orient: vertical;
      -webkit-box-pack: center;
      -webkit-box-sizing: border-box;
      border-bottom: 1px solid hsla(0, 0%, 100%, .1);
      box-sizing: border-box;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: center;
      min-height: 65px;
      padding: 13px 0
    }

    #oauth2-authorize .authorize-inner .scopes .scope .scope-inner .scope-name {
      color: #fff;
      font-size: 17px;
      font-weight: 500;
      line-height: 22px
    }

    #oauth2-authorize .authorize-inner .scopes .scope .scope-inner .scope-description {
      color: hsla(0, 0%, 100%, .2);
      font-size: 12px;
      line-height: 15px
    }

    #oauth2-authorize .authorize-inner .scopes .scope .scope-inner .scope-description strong {
      font-weight: 700
    }

    #oauth2-authorize .authorize-inner .scopes .scope .scope-inner .scope-error {
      color: #f04747
    }

    #oauth2-authorize .authorize-inner .scopes .scope:last-child .scope-inner {
      border-bottom: none
    }

    #oauth2-authorize .authorize-inner .scopes .scope.allow .scope-check-inner {
      background-color: #43b581;
      background-image: url("https://discordapp.com/assets/0dad6ae26c09abbd543809368519a210.svg")
    }

    #oauth2-authorize .authorize-inner .security-notice {
      -ms-flex-align: center;
      -ms-flex-pack: center;
      -webkit-box-align: center;
      -webkit-box-pack: center;
      align-items: center;
      background: #494b4f;
      color: hsla(0, 0%, 100%, .6);
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      font-size: 12px;
      font-weight: 500;
      justify-content: center;
      line-height: 15px;
      padding: 8px
    }

    #oauth2-authorize .authorize-inner .security-notice .security-notice-icon {
      -ms-flex-item-align: start;
      align-self: flex-start;
      background: url("https://discordapp.com/assets/070055737be7cc01fb3d27820574133e.png") 50% no-repeat;
      background-size: 9px 12px;
      display: inline-block;
      height: 12px;
      margin-right: 8px;
      width: 9px
    }

    #oauth2-authorize .authorize-inner .security-notice strong {
      font-weight: 700
    }

    #oauth2-authorize .authorize-inner footer {
      border-radius: 0 0 5px 5px;
      padding: 20px;
      text-align: right
    }

    #oauth2-authorize .authorize-inner footer button {
      background: none;
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      line-height: 19px;
      padding: 0
    }

    #oauth2-authorize .authorize-inner footer button:hover {
      border-bottom: 2px solid #fff
    }

    #oauth2-authorize .authorize-inner footer button.primary {
      background: #7289da;
      border-radius: 3px;
      padding: 8px 21px
    }

    #oauth2-authorize .authorize-inner footer button.primary:hover {
      background: #4e5d94;
      border-bottom: none
    }

    #oauth2-authorize .authorize-inner footer button+button {
      margin-left: 14px
    }

    #oauth2-authorize .select {
      position: relative
    }

    #oauth2-authorize .select select {
      -moz-appearance: none;
      -webkit-appearance: none;
      -webkit-box-sizing: border-box;
      appearance: none;
      background: #35383c;
      border: 2px solid hsla(0, 0%, 100%, .2);
      border-radius: 3px;
      box-sizing: border-box;
      color: hsla(0, 0%, 100%, .2);
      font-size: 16px;
      line-height: 19px;
      margin-top: 12px;
      padding: 12px;
      position: relative;
      width: 100%
    }

    #oauth2-authorize .select select:active,
    #oauth2-authorize .select select:focus {
      border-color: #7289da
    }

    #oauth2-authorize .select:after {
      border: 6px solid transparent;
      border-top-color: hsla(0, 0%, 100%, .2);
      content: " ";
      height: 0;
      margin-top: 3px;
      pointer-events: none;
      position: absolute;
      right: 14px;
      top: 50%;
      width: 0
    }

    #oauth2-authorize .select.focus:after {
      border-top-color: #7289da
    }

    #oauth2-authorize .select.has-value select {
      color: #fff
    }

    #oauth2-authorize .scope-bot .avatar-large {
      -ms-flex-align: center;
      -ms-flex-negative: 0;
      -ms-flex-pack: center;
      -webkit-box-align: center;
      -webkit-box-pack: center;
      align-items: center;
      background-color: #7289da;
      color: #fff;
      cursor: pointer;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      flex-shrink: 0;
      float: left;
      justify-content: center;
      margin-right: 10px;
      margin-top: 10px;
      opacity: .2
    }

    #oauth2-authorize .scope-bot .avatar-large.selected,
    #oauth2-authorize .scope-bot .avatar-large:hover {
      opacity: 1
    }

    #oauth2-authorize .bot-permissions {
      margin-top: 13px
    }

    #oauth2-authorize .bot-permissions ul {
      -ms-flex-flow: row wrap;
      -ms-flex-pack: justify;
      -webkit-box-direction: normal;
      -webkit-box-orient: horizontal;
      -webkit-box-pack: justify;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      margin-bottom: -13px;
      margin-top: 13px
    }

    #oauth2-authorize .bot-permissions ul li {
      -ms-flex-align: center;
      -webkit-box-align: center;
      align-items: center;
      color: #fff;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      margin: 0 0 13px;
      width: 50%
    }

    #oauth2-authorize .bot-permissions ul li.disallowed {
      -webkit-transition: color .24s;
      color: hsla(0, 0%, 100%, .3);
      transition: color .24s
    }

    #oauth2-authorize .bot-permissions ul li.disallowed .checkbox-inner span {
      border-color: hsla(0, 0%, 100%, .6)
    }

    @media only screen and (max-width: 500px) {
      #oauth2-authorize .authorize-inner {
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        width: auto
      }

      #oauth2-authorize .authorize-inner footer,
      #oauth2-authorize .authorize-inner header {
        border-radius: 0
      }

      #oauth2-authorize .authorize-inner .scroller-wrap {
        max-height: inherit
      }

      #oauth2-authorize .authorize-inner .security-notice,
      #oauth2-authorize .authorize-inner footer,
      #oauth2-authorize .authorize-inner header {
        -ms-flex-negative: 0;
        flex-shrink: 0
      }
    }

    #oauth2-authorize.no-background,
    #oauth2-authorize.no-background .authorize-inner:before {
      background: none
    }

    @font-face {
      font-family: Whitney;
      font-weight: 300;
      src: url("https://discordapp.com/assets/6c6374bad0b0b6d204d8d6dc4a18d820.woff") format("woff")
    }

    @font-face {
      font-family: Whitney;
      font-weight: 400;
      src: url("https://discordapp.com/assets/e8acd7d9bf6207f99350ca9f9e23b168.woff") format("woff")
    }

    @font-face {
      font-family: Whitney;
      font-weight: 500;
      src: url("https://discordapp.com/assets/3bdef1251a424500c1b3a78dea9b7e57.woff") format("woff")
    }

    @font-face {
      font-family: Whitney;
      font-weight: 600;
      src: url("https://discordapp.com/assets/be0060dafb7a0e31d2a1ca17c0708636.woff") format("woff")
    }

    @font-face {
      font-family: Whitney;
      font-weight: 700;
      src: url("https://discordapp.com/assets/8e12fb4f14d9c4592eb8ec9f22337b04.woff") format("woff")
    }

    @font-face {
      font-family: SourceCodePro;
      font-style: normal;
      font-weight: 400;
      src: url("https://discordapp.com/assets/375f5d0b0a54b53b92c351d7475eb152.woff") format("woff")
    }

    @font-face {
      font-family: SourceCodePro;
      font-style: normal;
      font-weight: 600;
      src: url("https://discordapp.com/assets/c383b1af097688e4ef1637838c2befe1.woff") format("woff")
    }

    a,
    abbr,
    acronym,
    address,
    applet,
    big,
    blockquote,
    body,
    caption,
    cite,
    code,
    dd,
    del,
    dfn,
    div,
    dl,
    dt,
    em,
    fieldset,
    form,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    html,
    iframe,
    img,
    ins,
    kbd,
    label,
    legend,
    li,
    object,
    ol,
    p,
    pre,
    q,
    s,
    samp,
    small,
    span,
    strike,
    strong,
    sub,
    sup,
    table,
    tbody,
    td,
    tfoot,
    th,
    thead,
    tr,
    tt,
    ul,
    var {
      border: 0;
      font-family: inherit;
      font-size: 100%;
      font-style: inherit;
      font-weight: inherit;
      margin: 0;
      padding: 0;
      vertical-align: baseline
    }

    ::placeholder,
    body,
    button,
    input,
    select,
    textarea {
      font-family: Whitney, Helvetica Neue, Helvetica, Arial, sans-serif
    }

    button {
      border: 0;
      cursor: pointer;
      font-family: Whitney, Helvetica Neue, Helvetica, Arial, sans-serif
    }
  </style>
</head>
<div id="oauth2-authorize" class="">
  <div class="authorize-inner">
    <header>
      <div class="application-name">
        <div>Connected to Discord</div>
        <div>Authorized</div>
      </div>
      <div class="application-icon">
        <div class="application-icon-inner" style="background-image: url(&quot;https://cdn.discordapp.com/app-icons/497128790426779649/1e31b70bab6dcadbb13b138f89dc00b6.png?size=128&quot;);"></div>
      </div>
    </header>
    <div class="scroller-wrap dark">
      <div class="scopes scroller"><label>This has allowed Authorizer to</label>
        <div class="scope allow">
          <div class="scope-check">
            <div class="scope-check-inner"></div>
          </div>
          <div class="scope-inner">
            <div class="scope-name">Access your username and avatar</div>
            <div class="scope-description">${user.username}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
function windowClose() {
  window.open('','_parent','');
  window.close();
  }
window.close()
</script>`
}