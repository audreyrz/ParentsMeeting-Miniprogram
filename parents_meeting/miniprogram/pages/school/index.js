// pages/school/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    selectedTeacherList:{},
    notification:[],
    currentTime:"",
    teacher_name:"",
    notParticipating:false //是否不参加家长会
  },
  previewImages() {
    wx.previewImage({
      current: 'cloud://hmzx-9gyzn96haa235cf8.686d-hmzx-9gyzn96haa235cf8-1323320011/1.png', // 当前显示图片的链接/路径
      urls: [
        'cloud://hmzx-9gyzn96haa235cf8.686d-hmzx-9gyzn96haa235cf8-1323320011/1.png',
        'cloud://hmzx-9gyzn96haa235cf8.686d-hmzx-9gyzn96haa235cf8-1323320011/2.png',
        'cloud://hmzx-9gyzn96haa235cf8.686d-hmzx-9gyzn96haa235cf8-1323320011/3.png',
        'cloud://hmzx-9gyzn96haa235cf8.686d-hmzx-9gyzn96haa235cf8-1323320011/4.png'
      ] // 需要预览的图片链接/路径列表
    });
  },
  getAnnouncements(){
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: "getAnnouncements"
      }
    }).then((resp) => {
      let res = resp.result.data
      console.log("Announcements data: ", res);
      this.setData({
        notification: res
      })
    })
  },
  gotoMeeting(){
    wx.navigateTo({
      url: '/pages/meeting/index' // 跳转至预约页面
    })
  },
  //获取班级信息
  getClassInfo(){
      wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getClassById',
          form: this.data.userInfo
        }
      }).then((resp) => {
        let data = resp.result.data
        if(data.length>0){
          this.setData({
            "userInfo.grade":data[0].grade,
            "userInfo.class":data[0].class
          })
          wx.setStorageSync('userInfo', JSON.stringify(this.data.userInfo));
        }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从本地存储中获取用户信息
    const userData = JSON.parse(wx.getStorageSync('userInfo'));
    this.setData({
      "userInfo": userData
    });
    this.getAnnouncements()
    //获取班级信息
    this.getClassInfo()
    this.getHomeroomAppoinmentInfoById()//获取班主任时间
    this.getAppoinmentInfoById()//获取已选科目
  },
  
  //获取班主任时间段预约信息
  getHomeroomAppoinmentInfoById(){
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getHomeroomAppoinmentInfoById',
        form: {
          studentId: this.data.userInfo.studentId,
        }
      }
    }).then((resp) => {
      let data = resp.result.data
      if(data.length>0){
        let notParticipating = data.find(item=>item.appointment_time=='不参加')
        console.log("notParticipating",!!notParticipating);
        if(!!notParticipating){
          this.setData({
            "notParticipating":true
          })
          wx.setStorageSync('notParticipating', true);
          wx.setStorageSync('notParticipatingId', notParticipating._id);
        }else{
          this.setData({
            "currentTime":data[0].appointment_time,
            "teacher_name":data[0].teacher_name
          })
        }
      }
    })
  },
  //获取预约科目老师信息
  getAppoinmentInfoById(){
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getAppoinmentInfoById',
        form: {
          studentId: this.data.userInfo.studentId
        }
      }
    }).then((resp) => {
      let data = resp.result.data
      if(data.length>0){
        let appointmentList = data
        this.setData({
          selectedTeacherList: appointmentList
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getHomeroomAppoinmentInfoById()//获取班主任时间
    this.getAppoinmentInfoById()//获取已选科目
    this.setData({
      "notParticipating":wx.getStorageSync('notParticipating')
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})