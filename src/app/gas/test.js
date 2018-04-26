$(function () {

});

var arWeight = [];
var arValue = [];

function clearData() {
  arWeight = [];
  arValue = [];
}

function createData() {
  clearData();
  var n = $('#_n').val();//so do vat
  var maxWeight = $('#_r').val();
  var content = '';
  for (var i = 0; i < n; i++) {
    arWeight.push(randomNumberFromRange(1, maxWeight));
    arValue.push(randomNumberFromRange(1, maxWeight));
    content += '<tr>';
    content += '<td>' + (i + 1) + '</td>';
    content += '<td>' + arWeight[i] + '</td>';
    content += '<td>' + arValue[i] + '</td>';
    content += '</tr>';
  }
  $('#tbl-rand').html(content);
}

var _table;
var popsNST = [];
function createPops() {
  tongthichnghi = 0;
  dothichnghi = [];
  if (_table) {
    _table.destroy();//KHÔNG LIÊN QUAN
  }
  var n = $('#_n').val();//Số bit trong mỗi cá thể (ở đây là 10)
  var p = $('#_p').val();//Số NST được tạo ra
  var maxWeight = $('#_t').val();
  var arrNhiPhan = [];
  for (var i = 0; i < n; i++) {
    arrNhiPhan.push(0);
  }
  flag = false;
  var pops = [];
  //duyệt dãy nhị phân để lấy hết các trường hợp.
  while (!flag) {
    var i = 0;
    while (arrNhiPhan[i] == 1) {
      arrNhiPhan[i] = 0; i++;
    }
    if (i < n) {
      arrNhiPhan[i] = 1;
      //var kq = getWeightAndValue(arrNhiPhan);
      //if (parseInt(kq.w) <= parseInt(maxWeight)) {
      pops.push(arrNhiPhan.toString().split(','));
      //}
    }
    else {
      flag = true;
    }
  }
  //lay theo so luong dan so
  popsNST = getRandom(pops, p);// lấy random 50 cá thể đưa vào quần thể ban đầu
  //in ra quần thể ban đầu
  $('#tbl-solved').html('');
  for (var i = 0; i < popsNST.length; i++) {
    var kq = getWeightAndValue(popsNST[i]);
    $('#tbl-solved').append(gHTML((i + 1), popsNST[i], kq.w, kq.v));
    dothichnghi.push(kq.v);
  }
  _table = $('#table-solved').DataTable({//không liên quan
    "lengthMenu": [[100, 50, 25, 10, -1], [100, 50, 25, 10, "All"]],
    searching: false,
    destroy: true,
    "paging": false,
    retrieve: true
  });
}

var table_laighep;
var tongthichnghi = 0;
var dothichnghi = [];
function ok() {
  if (table_laighep) {
    table_laighep.destroy();//không liên quan
  }
  var n = $('#_n').val();//Số bit trong mỗi cá thể (10)
  var p = $('#_p').val();//Số lượng cá thể trong quần thể (50)
  var xsdb = parseFloat($('#_xsdb').val());//xác suất đột biến (0.15)
  var vitrixacsuat = [];//đọc thêm trong bài toán để hiểu trang 19
  var maxWeight = $('#_t').val();//tải trọng túi (100)
  var SOLANLAP = $('#_lap').val();//số lần lặp tối đa (số thể hệ được lặp)
  var loop = 0;
  while (loop < SOLANLAP) {//bát đầu vòng lặp
    loop++;
    console.log('----------- LẦN LẶP THỨ ' + loop + ' --------------');

    tongthichnghi = 0;
    vitrixacsuat = [];
    //tạo ra mảng dothichnghi chứa các giá trị của các NST
    dothichnghi = [];
    for (var i = 0; i < popsNST.length; i++) {
      dothichnghi.push(tinhDoThichNghi(popsNST[i]));
    }
    //đổi bit 1 thành 0 của những NST có khối lượng lớn hơn 100
    for (var i = 0; i < dothichnghi.length; i++) {
      if (dothichnghi[i] > maxWeight) {
        var nst = popsNST[i];
        while (tinhKhoiLuong(nst) > maxWeight) {//lặp trong NST để đổi 1 thành 0
          for (var j = 0; j < nst.length; j++) {
            if (nst[j] == 1) {
              nst[j] = 0;
              break;
            }
          }
        }
        popsNST[i] = nst;
        dothichnghi[i] = tinhDoThichNghi(nst);
      }
      tongthichnghi += dothichnghi[i];
    }
    console.log('tong do thich nghi: ' + tongthichnghi);
    //tính vị trí xác suất trong bánh xe roulette - trang 20
    var t = 0;
    for (var i = 0; i < dothichnghi.length; i++) {
      var xs = parseFloat((dothichnghi[i] / tongthichnghi).toFixed(3)) + t;
      t = parseFloat(xs.toFixed(3));
      if (i == dothichnghi.length - 1 && t != 1) {
        t = 1;
      }
      vitrixacsuat.push(t);
    }
    console.log('vi tri xac suat: ' + vitrixacsuat);
    var newNST = [];//quần thể NST mới sau khi quay bánh xe roulette
    var arrVTR = [];//mảng vị trí rơi
    //quay banh xe Roulette
    for (var i = 0; i < dothichnghi.length; i++) {
      var vitriroi = randomNumberFromRange(0, 1000) / 1000;//lấy ngẫu nhiên xác suất
      arrVTR.push(vitriroi);
      newNST.push(popsNST[getNewNST(vitrixacsuat, vitriroi)]);
    }
    console.log('vi tri roi: ' + arrVTR);
    console.log('NST moi: ');
    console.log(newNST);

    //lai ghep
    var r_laighep = [];//mảng chứa giá trị xác định xem NST nào đc lai ghép ví dụ [1,0,0,0,0,1,0...]
    var xslg = parseFloat($('#_xslg').val());//xac suat lai ghep
    for (var i = 0; i < newNST.length; i++) {
      var xacsuat = randomNumberFromRange(0, 100);
      if (xacsuat <= xslg * 100) {
        r_laighep.push(1);//được lai ghép
      }
      else {
        r_laighep.push(0);//không được lai ghép
      }
    }
    var len = newNST.length;
    var arrLaiGhep = [];//mảng chứa các cặp NST được lai ghép
    var NST_saulaighep = [];//quần thể NST mới sau khi được lai ghép
    var count = 0;
    var temp = [];
    for (var i = 0; i < len; i++) {//vòng lặp lấy ra các cặp được lai ghép với nhau
      if (r_laighep[i] == 1) {
        temp.push(i);
        count++;
      }
      if (count == 2) {
        arrLaiGhep.push(temp);
        temp = [];
        count = 0;
      }
      NST_saulaighep.push(newNST[i]);
    }
    //bat dau lai ghep
    console.log('cac cap lai ghep va vi tri: ');
    for (var i = 0; i < arrLaiGhep.length; i++) {
      var vx = arrLaiGhep[i][0];//NST đầu tiên
      var vy = arrLaiGhep[i][1];//NST thứ 2
      var pos = randomNumberFromRange(1, n - 1);//vị trí lai ghép - trang 22
      console.log(vx + '-' + vy + '-' + pos);
      var NST_X = NST_saulaighep[vx];
      var NST_Y = NST_saulaighep[vy];
      var NST_Temp_X = [];//NST trung gian
      var NST_Temp_Y = [];//NST trung gian
      for (var j = 0; j < n; j++) {//lai ghép 2 NST với nhau đẩy vào 2 biến NST trung gian
        if (j < pos) {
          NST_Temp_X.push(NST_X[j]);
          NST_Temp_Y.push(NST_Y[j]);
        }
        else {
          NST_Temp_X.push(NST_Y[j]);
          NST_Temp_Y.push(NST_X[j]);
        }
      }
      NST_saulaighep[vx] = NST_Temp_X;//cập nhật lại NST sau lai ghép
      NST_saulaighep[vy] = NST_Temp_Y;
    }
    //dot bien
    var r_dotbien = [];//mang random cac bit NST dot bien
    var tongsobit = len * n;
    var NST_saudotbien = NST_saulaighep;
    for (var i = 0; i < tongsobit; i++) {
      var xacsuat = randomNumberFromRange(0, 100);
      if (xacsuat <= xsdb * 100) {
        r_dotbien.push(1);//được đột biến
      }
      else {
        r_dotbien.push(0);//không đột biến
      }
    }
    console.log('NST dot bien: ' + r_dotbien);

    var c = 0;
    //thực hiện đột biến
    for (var i = 0; i < len; i++) {
      for (var j = 0; j < n; j++) {
        if (r_dotbien[c] == 1) {
          if (NST_saudotbien[i][j] == 0) {
            NST_saudotbien[i][j] = 1;
          }
          else {
            NST_saudotbien[i][j] = 0;
          }
        }
        c++;
      }
    }
    console.log('NST sau khi dot bien: ');
    console.log(NST_saudotbien);
    popsNST = NST_saudotbien;//gán lại quần thể mới để thực hiện vòng lặp tiếp
  }

  //in ket qua
  for (var i = 0; i < popsNST.length; i++) {
    var kq = getWeightAndValue(popsNST[i]);
    if (kq.w <= maxWeight) {
      $('#tbl-laighep').append(gHTML((i + 1), popsNST[i], kq.w, kq.v));
    }
  }
  table_laighep = $('#table-laighep').DataTable({
    "lengthMenu": [[100, 50, 25, 10, -1], [100, 50, 25, 10, "All"]],
    searching: false,
    destroy: true,
    "paging": false,
    retrieve: true
  });
}



function getNewNST(vitrixacsuat, vitriroi) {//lay vi tri NST duoc chon khi quay banh xe roulette
  if (vitriroi < vitrixacsuat[0]) {
    return 0;
  }
  var index = 0;
  for (var i = 0; i < vitrixacsuat.length - 1; i++) {
    if (vitriroi > vitrixacsuat[i] && vitriroi < vitrixacsuat[i + 1]) {
      index = i + 1;
      break;
    }
  }
  return index;
}

function randomNumberFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function gHTML(index, pp, weight, value) {
  var content = '<tr>';
  content += '<td>' + index + '</td>';
  content += '<td>' + pp + '</td>';
  content += '<td>' + weight + '</td>';
  content += '<td>' + value + '</td>';
  content += '</tr>';
  return content;
}

function tinhKhoiLuong(nst) {
  var v = 0;
  for (var i = 0; i < nst.length; i++) {
    v += arWeight[i] * parseInt(nst[i]);
  }
  return v;
}

function tinhDoThichNghi(nst) {
  var v = 0;
  for (var i = 0; i < nst.length; i++) {
    v += arValue[i] * parseInt(nst[i]);
  }
  return v;
}

function getWeightAndValue(arr) {
  var w = 0;
  var v = 0;
  for (var i = 0; i < arr.length; i++) {
    w += arWeight[i] * parseInt(arr[i]);
    v += arValue[i] * parseInt(arr[i]);
  }
  var obj = new Object();
  obj.w = w;
  obj.v = v;
  return obj;
}

function getRandom(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    return arr;
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}
