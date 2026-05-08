const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

const zip = new JSZip();

// app.json
zip.file("app.json", JSON.stringify({
    "pages": [
        "pages/index/index",
        "pages/logs/logs"
    ],
    "window": {
        "backgroundTextStyle": "light",
        "navigationBarBackgroundColor": "#fff",
        "navigationBarTitleText": "WeChat",
        "navigationBarTextStyle": "black"
    },
    "style": "v2",
    "sitemapLocation": "sitemap.json"
}, null, 2));

// app.js
zip.file("app.js", `
App({
  onLaunch() {
    // Exhibit the startup logic
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // Login logic
    wx.login({
      success: res => {
        console.log('Login Code:', res.code);
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
`);

// pages/index/index.js
zip.file("pages/index/index.js", `
// index.js
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // Event handler
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  getUserProfile(e) {
    // Recommended way to get user info
    wx.getUserProfile({
      desc: 'Displaying User Info', 
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // Old way
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
`);

// pages/index/index.wxml
zip.file("pages/index/index.wxml", `
<view class="container">
  <view class="userinfo">
    <block wx:if="{{!hasUserInfo}}">
      <button wx:if="{{canIUseGetUserProfile}}" bindtap="getUserProfile"> 获取头像昵称 </button>
      <button wx:elif="{{canIUse}}" open-type="getUserInfo" bindgetuserinfo="getUserInfo"> 获取头像昵称 </button>
      <view wx:else> 请使用1.4.4及以上版本基础库 </view>
    </block>
    <block wx:else>
      <image bindtap="bindViewTap" class="userinfo-avatar" src="{{userInfo.avatarUrl}}" mode="cover"></image>
      <text class="userinfo-nickname">{{userInfo.nickName}}</text>
    </block>
  </view>
  <view class="usermotto">
    <text class="user-motto">{{motto}}</text>
  </view>
</view>
`);

// pages/index/index.wxss
zip.file("pages/index/index.wxss", `
/**index.wxss**/
.userinfo {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #aaa;
}

.userinfo-avatar {
  overflow: hidden;
  width: 128rpx;
  height: 128rpx;
  margin: 20rpx;
  border-radius: 50%;
}

.usermotto {
  margin-top: 200px;
}
`);

// Generate
zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream(path.join(process.cwd(), 'public', 'demo.zip')))
    .on('finish', function () {
        console.log("demo.zip written.");
    });
