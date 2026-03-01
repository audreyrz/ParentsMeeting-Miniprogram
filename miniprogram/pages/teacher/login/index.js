Page({
  data: {
    form: {
      _id: '',
      teacherName: '',
      teacherId: '',
      openId:[],//微信唯一id
      homeroomId: ''
    }
  },
  /**
   * 页面加载
   */
  onLoad () {
    this.init() // 初始化
  },
  /**
   * 初始化加载信息
   */
  // OpenId auto login
  
  async init () {
    const that = this;
    //获取当前用户微信唯一id
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      that.setData({
        "form.openId": [resp.result.openid] //获取到的微信id存入全局变量
      });
      //查询是否可以静默登录，针对已绑定学生的家长微信
      wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'teacherOpenIdLogin',
          form: that.data.form
        }
      }).then((resp) => {
        let data = resp.result.data
        if(data.length>0){
          that.setData({
            "form": data[0] //保存获取到的用户信息
          });
          // 将用户信息以 JSON 字符串的形式保存到本地存储中
          wx.setStorageSync('teacherInfo', JSON.stringify(that.data.form));
          wx.showLoading({
            title: '自动登录中',
          })
          // 在当前页面的事件处理函数中跳转到另一个页面
          wx.navigateTo({
            url: '/pages/teacher/school/index' // 跳转的页面路径
          });
        }
      })
   }).catch((e) => {
    });
  },


  /**
   * 登录
   */
  
  async formSubmit (e) {
    const name = e.detail.value.teacherName;
    const id = e.detail.value.teacherId;
    const that = this;
    // 更新表单控件的值
    that.setData({
      'form.teacherName': name,
      'form.teacherId': id
    });

    //验证登录信息
    if (!that.data.form.teacherName || !that.data.form.teacherId) {
      // 如果姓名或学号未填写，则显示错误提示
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '登录中',
    })
    //登录
    wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'teacherLogin',
          form: that.data.form
        }
      }).then((resp) => {
        let data = resp.result.data
        //data.length>0查询到对应结果，登录成功
        if(data.length>0){
          let openIdArr = data[0].openId 
          if(!openIdArr.includes(that.data.form.openId[0])){//如果表中没有对应openid
            that.bindOpenId()
          }
          wx.showToast({
            title: '登录成功',
            icon:"success",
            mask: true,
            success: function() { 
                // 更新班级信息
                that.setData({
                  'form.homeroomId': data[0].homeroomId,
                  'form._id': data[0]._id
                });
               // 将用户信息以 JSON 字符串的形式保存到本地存储中
              wx.setStorageSync('teacherInfo', JSON.stringify(that.data.form));
              // 跳转至主页
              wx.navigateTo({
                url: '/pages/teacher/school/index' 
              });
            },
          })
        }else{
          wx.showToast({
            title: '未查到老师信息',
            icon:"error"
          })
        }
     }).catch((e) => {
        wx.showToast({
          title: '登录失败，系统错误',
          icon:"error"
        })
     });
     wx.hideLoading();
  },
   /**
   * 绑定微信id到学生表
   */
    bindOpenId(){
      let that = this
      wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'bind',
          form: that.data.form
        }
      }).then((resp) => {})
  }
})