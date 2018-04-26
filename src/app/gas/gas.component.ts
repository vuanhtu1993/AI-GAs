import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Genome} from './model';

@Component({
  selector: 'app-gas',
  templateUrl: './gas.component.html',
  styleUrls: ['./gas.component.css']
})
export class GasComponent implements OnInit {
  items = [];
  chromosome = [];
  chromosomeInitial = [];
  population = [];
  dothichnghi = [];
  tongthichnghi = 0;
  NST_saudotbien = [];
  @ViewChild('weightBalo') weightBalo: ElementRef;

  constructor() {
  }

  ngOnInit() {
  }

  // generate item
  createData(item, weightMax, valueMax) {
    this.items = [];
    for (let i = 0; i < item.value; i++) {
      this.items.push(this.random(weightMax.value, valueMax.value));
    }
  }

  random(weightMax, valueMax) {
    const weight = Math.floor(Math.random() * weightMax) + 1;
    const value = Math.floor(Math.random() * valueMax) + 1;
    return {weight: weight, value: value};
  }

  // calculate value and weight
  calculateValue(binaryNumber) {
    const arr = binaryNumber.split('');
    let value = 0, weight = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === '1') {
        value += this.items[i].value;
        weight += this.items[i].weight;
      }
    }
    return new Genome(arr, value, weight);
  }

  // generate population
  createPopulation(number) {
    const amount = Math.pow(2, number.value);
    for (let i = 0; i < amount; i++) {
      let binaryNumber = i.toString(2);
      binaryNumber = '0'.repeat(number.value - binaryNumber.length) + binaryNumber;
      this.population.push(binaryNumber);
    }
    this.createChromosome(amount);
  }

  // generate chromosome
  createChromosome(amount) {
    this.chromosome = [];
    for (let i = 0; i < amount; i++) {
      const random = Math.floor(Math.random() * amount) + 1;
      if (this.chromosome.length < 50) {
        const ct = this.calculateValue(this.population[random]);
        this.chromosome.push(ct);
      } else {
        break;
      }
    }
    this.chromosomeInitial = JSON.parse(JSON.stringify(this.chromosome));
  }

  // route wheel

  // Fitness
  fitness() {
    for (let i = 0; i < this.chromosome.length; i++) {
      const ct = this.chromosome[i];
      while (this.calculate(ct).weight > this.weightBalo.nativeElement.value) {
        for (let j = 0; j < ct.code.length; j++) {
          if (ct.code[j] === '1') {
            ct.code[j] = '0';
            break;
          }
        }
      }
      this.dothichnghi[i] = this.calculate(ct).value;
      this.tongthichnghi += this.dothichnghi[i];
    }
  }

  // Calculate and return weight of item
  calculate(ct) {
    let value = 0, weight = 0;
    for (let i = 0; i < ct.code.length; i++) {
      if (ct.code[i] === '1') {
        value = value + this.items[i].value;
        weight = weight + this.items[i].weight;
      }
    }
    ct.value = value;
    ct.weight = weight;
    return {
      weight: ct.weight,
      value: ct.value
    };
  }

  // get result
  getResult(xslg, xsdb) {
    this.fitness();
    console.log(this.chromosome);
    // tính vị trí xác suất trong bánh xe roulette
    let t = 0;
    const vitrixacsuat = [];
    for (let i = 0; i < this.dothichnghi.length; i++) {
      const xs = parseFloat((this.dothichnghi[i] / this.tongthichnghi).toFixed(3)) + t;
      t = parseFloat(xs.toFixed(3));
      if (i === this.dothichnghi.length - 1 && t !== 1) {
        t = 1;
      }
      vitrixacsuat.push(t);
    }
    const newNST = []; // quần thể NST mới sau khi quay bánh xe roulette
    const arrVTR = []; // mảng vị trí rơi
    // quay banh xe Roulette
    for (let i = 0; i < this.dothichnghi.length; i++) {
      const vitriroi = this.randomNumberFromRange(0, 1000) / 1000; // lấy ngẫu nhiên xác suất
      arrVTR.push(vitriroi);
      newNST.push(this.chromosome[this.getNewNST(vitrixacsuat, vitriroi)]);
    }
    // Cross over
    const r_laighep = []; // mảng chứa giá trị xác định xem NST nào đc lai ghép ví dụ [1,0,0,0,0,1,0...]
    for (let i = 0; i < newNST.length; i++) {
      const xacsuat = this.randomNumberFromRange(0, 100);
      if (xacsuat <= xslg.value * 100) {
        r_laighep.push(1); // được lai ghép
      } else {
        r_laighep.push(0); // không được lai ghép
      }
    }
    const len = newNST.length;
    const arrLaiGhep = []; // mảng chứa các cặp NST được lai ghép
    const NST_saulaighep = []; // quần thể NST mới sau khi được lai ghép
    let count = 0;
    let temp = [];
    for (let i = 0; i < len; i++) { // vòng lặp lấy ra các cặp được lai ghép với nhau
      if (r_laighep[i] === 1) {
        temp.push(i);
        count++;
      }
      if (count === 2) {
        arrLaiGhep.push(temp);
        temp = [];
        count = 0;
      }
      NST_saulaighep.push(newNST[i]); // Khoong hieru doan nay
      // console.log(newNST[i]);
    }
    // console.log("arr lai ghep", arrLaiGhep);
    // console.log('mảng chứa các cặp NST được lai ghép', arrLaiGhep);
    // console.log('quần thể NST mới sau khi được lai ghép', NST_saulaighep);
    // bat dau lai ghep
    // console.log('cac cap lai ghep va vi tri: ');
    for (let i = 0; i < arrLaiGhep.length; i++) {
      const vx = arrLaiGhep[i][0]; // NST đầu tiên
      const vy = arrLaiGhep[i][1]; // NST thứ 2
      const pos = this.randomNumberFromRange(1, 10); // vị trí lai ghép
      // console.log(vx + '-' + vy + '-' + pos);
      const NST_X = NST_saulaighep[vx].code;
      const NST_Y = NST_saulaighep[vy].code;
      // console.log('bat dau lai ghep', NST_X, vx, NST_Y, vy);
      const NST_Temp_X = []; // NST trung gian
      const NST_Temp_Y = []; // NST trung gian
      for (let j = 0; j < 10; j++) { // lai ghép 2 NST với nhau đẩy vào 2 biến NST trung gian
        if (j < pos) {
          NST_Temp_X.push(NST_X[j]);
          NST_Temp_Y.push(NST_Y[j]);
        } else {
          NST_Temp_X.push(NST_Y[j]);
          NST_Temp_Y.push(NST_X[j]);
        }
      }
      NST_saulaighep[vx].code = NST_Temp_X; // cập nhật lại NST sau lai ghép
      NST_saulaighep[vy].code = NST_Temp_Y;
    }
    // console.log('quần thể NST mới sau khi được lai ghép 2', NST_saulaighep);
    // dot bien
    const r_dotbien = []; // mang random cac bit NST dot bien
    const tongsobit = len * 10;
    const   NST_saudotbien = NST_saulaighep.slice();
    // console.log(NST_saudotbien);
    for (let i = 0; i < tongsobit; i++) {
      const xacsuat = this.randomNumberFromRange(0, 100);
      if (xacsuat <= xsdb.value * 100) {
        r_dotbien.push('1'); // được đột biến
      } else {
        r_dotbien.push('0'); // không đột biến
      }
    }
    // console.log('NST dot bien: ' + r_dotbien);

    let c = 0;
    // thực hiện đột biến
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < 10; j++) {
        if (r_dotbien[c] === 1) {
          if (NST_saudotbien[i].code[j] === 0) {
            NST_saudotbien[i].code[j] = 1;
          } else {
            NST_saudotbien[i].code[j] = 0;
          }
        }
        c++;
      }
    }
    NST_saudotbien.map((ct) => this.calculate(ct));
    this.NST_saudotbien = NST_saudotbien.sort(this.dynamicSort('value'));
    this.chromosome = JSON.parse(JSON.stringify(NST_saudotbien));
    console.log('NST sau dot bien', this.chromosome);
  }
  // Sorting array of object corresponding key
  dynamicSort(property) {
    let sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      const result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
      return result * sortOrder;
    };
  }

  // lay vi tri NST duoc chon khi quay banh xe roulette
  getNewNST(vitrixacsuat, vitriroi) {
    if (vitriroi < vitrixacsuat[0]) {
      return 0;
    }
    let index = 0;
    for (let i = 0; i < vitrixacsuat.length - 1; i++) {
      if (vitriroi > vitrixacsuat[i] && vitriroi < vitrixacsuat[i + 1]) {
        index = i + 1;
        break;
      }
    }
    return index;
  }
  randomNumberFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
