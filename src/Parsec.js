// @flow
import {DEBUG} from "@macros/env-flags"



type Error = {errorPos:number,errorMsg:string}
type Success<A> = {success: true, position:number, result: A };
type Failed  = { success: false, position:number, error:Error };
type ParseFn<A> = (input:string,position:number) => Success<A> | Failed;


class Parser<A> {
  +run:ParseFn<A>;
  constructor(f:ParseFn<A>) {
    this.run = f;
  }

  thenF<B>(f:A=>Parser<B>):Parser<B> {
    return new Parser((s,i) =>{
      let a = this.run(s,i);
      if (a.success) {
        return f(a.result).run(s,a.position);
      } else {
        return a;
      }
    });
  }

  then<B>(p:Parser<B>):Parser<B> {
    return this.thenF(()=>p);
  }

  map<B>(f:A=>B):Parser<B> {
    return new Parser((s,i) => {
      let a = this.run(s,i);
      if (a.success) {
        return {success:true,position:a.position,result:f(a.result)}
      } else {
        return a;
      }
    });
  }

  many():Parser<A[]> {
    return new Parser((s,pos) =>{
      var a,i = pos,results = [];
      while (true) {
        a = this.run(s,i);
        if (a.success) {
          results.push(a.result);

          if (DEBUG && a.position === i) {
            throw new Error("Parsec many on nullable parser!");
          }

          i = a.position;
        } else {
          break;
        }
      }
      return {success:true,position:i,result:results};
    });
  }
}


function alt<A>(...parsers:Array<Parser<A>>):Parser<A> {
  return new Parser((s,pos) => {
    var a,i=0;
    do {
      let p = parsers[i];
      a = p.run(s,pos);
      if (a.success || a.position != pos) return a;
    } while (++i < parsers.length);
    return a;
  });
}


function exacts(s:string):Parser<string> {
  return new Parser((input,i) => {
    let l = s.length;
    if (input.substr(i,l) === s) {
      return {success:true,position:i+l,result:s};
    } else {
      return {success:false,position:i,error:{errorPos:i,errorMsg:"Expect "+JSON.stringify(s)}}
    }
  });
}









