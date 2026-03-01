Page({
  data: {
    form: {
      studentName: '',//学生姓名
      studentId: '',//学生学号
      openId:[],//微信唯一id
      grade_id:'',//班级id
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
          type: 'openIdLogin',
          form: that.data.form
        }
      }).then((resp) => {
        let data = resp.result.data
        if(data.length>0){
          that.setData({
            "form": data[0] //保存获取到的用户信息
          });
          // 将用户信息以 JSON 字符串的形式保存到本地存储中
          wx.setStorageSync('userInfo', JSON.stringify(that.data.form));
          wx.showLoading({
            title: '自动登录中',
          })
          // 在当前页面的事件处理函数中跳转到另一个页面
          wx.navigateTo({
            url: '/pages/school/index' // 跳转的页面路径
          });
        }
      })
   }).catch((e) => {
    });
  },

  teacherRedirect () {
    wx.navigateTo ({
      url: "/pages/teacher/login/index"
    })
  },

  adminRedirect () {
    wx.navigateTo ({
      url: "/pages/adminSuper/index"
    })
  },

  /**
   * 登录
   */
  async formSubmit (e) {
    const name = e.detail.value.studentName;
    const id = e.detail.value.studentId;
    const that = this;
    // 更新表单控件的值
    that.setData({
      'form.studentName': name,
      'form.studentId': id
    });
    //验证登录信息
    if (!that.data.form.studentName || !that.data.form.studentId) {
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
          type: 'login',
          form: that.data.form
        }
      }).then((resp) => {
        let data = resp.result.data
        //data.length>0查询到对应结果，登录成功
        if(data.length>0){
          //绑定openid到学生表
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
                  'form.grade_id': data[0].grade_id
                });
               // 将用户信息以 JSON 字符串的形式保存到本地存储中
              wx.setStorageSync('userInfo', JSON.stringify(that.data.form));
              // 跳转至主页
              wx.navigateTo({
                url: '/pages/school/index' 
              });
            },
          })
        }else{
          wx.showToast({
            title: '未查到学生信息',
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