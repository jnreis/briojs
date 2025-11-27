let ie = (e) => e.trim(), _e = (e) => e.toLowerCase(), re = (e, t, l) => e.split(t, l), or = (e) => e.toUpperCase(), ms = (e) => or(e[0]) + We(e, 1), Ps = (e) => _e(e[0]) + We(e, 1), $t = (e, t, l) => e[ff](t, l), di = (e, t, l) => e[Zs](t, l), ne = (e, t) => t.test(e), ke = (e, t, l) => e[pi](t, l), vl = (e, t, l) => {
  for (; ne(e, t); )
    e = ke(e, t, l);
  return e;
}, ds = (e) => ne(e, /^\d+$/), gs = (e) => ne(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !$t(e, H + " "), pr = (e) => ne(ie(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), xs = (e) => Ps(Ne($e(re(e, "-"), ms), "")), hr = (e) => JSON.stringify(e), ti = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, li = (e) => "`" + e + "`", Z = (...e) => Ne(e, " "), Zt = "brio", pt = "$", lt = "$for", Bl = "$ref", Fl = "$slot", Rr = "$store", ft = "after", rl = "append", at = "array", se = "attr", ii = "Attribute", Nr = "a valid", K = "b-", Ar = "b-for", Se = "b-if", yr = "b-ignore", ri = "b-ref", Or = "b-save", bt = "b-show", _r = "b-slot", Ht = "before", Ls = "body", el = "boolean", Sr = "can only be used on", Ir = "Cannot ", Qe = "checkbox", be = "checked", $s = "Child", Us = "class", wr = "clone", si = "composi", fi = "content", Cr = "Content", kt = "create", ht = "data", sl = "debounce", Dr = "detail", mr = "define", H = "delete", Ge = "directive", Hl = "disconnect", Ms = "display", ai = "document", Le = "element", tl = "email", Pr = "end", gi = "entries", xi = "error", Li = "event", dr = "EventListener", gr = "exit", Yt = "get", xr = "head", $i = "href", ni = "html", ci = "HTML", _l = "hydrate", Lr = "index", vs = "inner", Bs = "insert", Ei = "Invalid", kl = "length", Sl = "mask", $r = "message", Fs = "method", Oe = "must be", we = `
`, it = "newValue", Ur = "name", fl = "Node", nt = "nodes", Mr = "not found.", Rt = null, J = "number", zt = "object", vr = "observe", It = "oldValue", Ti = "on-", Ui = Ti + "enter", Mi = Ti + gr, vi = Ti + "resize", Hs = "once", ui = "operation", Ue = "options", ks = "outer", Il = "parent", Bi = "patch", Ys = "post", Yl = "prepend", Br = "prevent", Fr = "Propert", oi = Fr + "y", he = "props", Hr = "put", Fi = "radio", Ve = "remove", pi = "replace", wl = "requires", al = "route", b = "script", j = "skip", G = "select", ee = "state", kr = "start", hi = "storage", Pe = "string", ge = "style", zs = "super", Yr = "teleport", pe = "template", V = "text", Hi = "throttle", Ri = "tion", Ks = "toString", ll = "transition", zr = "type", ce, Kr = "update", Wr = "valid", m = "value", Ni = "With", Ws = "add" + dr, nl = pt + ht, Kt = "$de" + _l, Wt = pt + _l, Cl = pt + Bs, cl = pt + he, Me = K + ht, Gr = K + ni, Ai = K + b, Dl = K + pe, Gs = K + V, Vr = $s + "ren", jr = Us + "List", Vs = wr + fl, El = si + "ng", js = si + Ri + kr, Xs = si + Ri + Pr, qs = kt + "Comment", Qs = kt + "Element", zl = mr + oi, Js = mr + Fr + "ies", tt = "de" + _l + Vr, ki = H + oi, Xr = Ge + "s", Zs = "ends" + Ni, ml = "func" + Ri, bs = Yt + ii, Yi = xr + "ers", mt = vs + ci, Y = "in" + Hr, zi = Sl + "s", qr = Sl + "Token", Ki = qr + "s", Tl = "of " + zr, Qr = ks + ci, Jr = "Own" + oi, ef = Il + fl, ul = "path" + Ur, tf = Br + "Default", Zr = "proto" + zr, lf = Ve + ii, rf = Ve + dr, Pt = pi + Ni, wt = pi + Vr, Wi = al + "Rule", Ll = G + "ionStart", br = G + "or", sf = "set" + ii, ff = kr + "s" + Ni, af = hi + "Area", fe = "tar" + Yt, et = V + "area", Ye = V + Cr, nf = Wr + "ate", cf = Wr + "ator", Ef = "async" + ml, es = Yt + Jr + "Descriptor", Tf = es + "s", uf = "has" + Jr, of = br + "Text", ts = (e, t, l, i) => `the ${e} ${t} ${wl} ${l}, ` + yi(i), yi = (e) => `but got ${e} instead.`, pf = (e) => Z(e, wl, "a reactive", m), P = (e, ...t) => e.push(...t), hf = (e, t) => e.sort(t), Ne = (e, t) => e.join(t), I = (e, t) => e.forEach(t), $e = (e, t, l) => e.map(t, l), dt = (e, t, l) => e.filter(t, l), Oi = (e, t, l) => e.find(t, l), _i = (e, t, l) => e.every(t, l), ls = (e, t, l) => e.some(t, l), Rf = (e, t, l) => e.indexOf(t, l), Nf = (e, t) => t[1] - e[1], ze = (e) => Array.from(e), Gi = (e, t = 0) => $e(ze({ [kl]: e }), (l, i) => t + i), Ke = (e) => _e(We(Ae[Zr][Ks].call(e), 8, -1)), je = (e, t) => Ke(e) === t, ae = (e) => e === Rt, ol = (e) => e === ce, Ee = (e) => je(e, zt), M = (e) => je(e, at), ve = (e) => Af(e) || yf(e), Af = (e) => je(e, ml), yf = (e) => je(e, Ef), v = (e) => je(e, Pe), Ce = (e) => je(e, J) && !isNaN(e), Of = (e) => je(e, el), _f = (e) => Nt(e, is), Nt = (e, t) => e instanceof t, rt = (e) => Nt(e, Node), Sf = (e) => Nt(e, Text), De = (e) => Nt(e, HTMLElement), Kl = (e) => Nt(e, Map), Wl = (e) => Nt(e, Set), de = window, Ae = Object, Ot = Reflect, pl = location, At = de[ai], If = Symbol, is = RegExp, W = (e, t) => Ae[Zr][uf].call(e, t), Ie = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, Xe = (e, t) => delete e[t], wf = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], z = (e, t, l = ce, i = "") => {
  if (v(i)) {
    let r = i;
    i = { [m]: l }, I(wf, ([n, a]) => {
      i[a] = !U(r, n);
    });
  }
  Ae[zl](e, t, i);
}, gt = (e) => C(Re(e)), Re = (e) => Ae.keys(e), Cf = (e = Rt) => Ae[kt](e), Df = (e, t = {}) => {
  const l = Cf(e);
  return Ae[Js](
    l,
    Ae[Tf](t)
  ), l;
}, mf = (e, t, l = Ae) => l[es](e, t), Pf = (e) => Ae.getPrototypeOf(e), Si = (e, t = {}) => {
  I(Re(e), (l) => {
    z(e, l, e[l], t);
  });
}, Ii = (e) => I(Re(e), (t) => {
  Xe(e, t);
}), ue = (e = ce) => new Map(e), Gt = (e = ce) => new Set(e), df = (e, t) => new is(e, t), xt = (e, t) => {
  if (e === t) return e;
  if (M(e) && M(t)) {
    for (; C(e) > C(t); ) e.pop();
    for (let l = 0; l < C(t); l++)
      l < C(e) ? e[l] = xt(e[l], t[l]) : e.push(xe(t[l]));
  } else if (Kl(e) && Kl(t)) {
    let l = ue(e);
    e.clear();
    for (let [i, r] of qe(t))
      e.set(i, l.has(i) ? xt(l.get(i), r) : xe(r));
  } else if (Wl(e) && Wl(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (Ee(e) && Ee(t)) {
    let l = { ...e };
    Ii(e);
    for (let i in t)
      W(t, i) && (e[i] = W(l, i) ? xt(l[i], t[i]) : xe(t[i]));
  } else
    return t;
  return e;
}, xe = (e) => {
  let t = e;
  if (Ee(e)) {
    let l = {};
    for (let i in e)
      W(e, i) && (l[i] = xe(e[i]));
    t = l;
  }
  return M(e) && (t = $e(e, xe)), Kl(e) && (t = ue($e(ze(qe(e)), ([l, i]) => [l, xe(i)]))), Wl(e) && (t = Gt($e(ze(e), xe))), t;
}, U = (e, t, l) => e.includes(t, l), qe = (e) => Ee(e) ? Ae[gi](e) : e[gi](), We = (e, t, l) => e.slice(t, l), C = (e) => ol(e[kl]) ? e.size : e[kl], Vt = (e, t = 0) => setTimeout(e, t), gf = (e) => {
  clearTimeout(e);
}, hl = (e, t) => {
  let l;
  return (...i) => {
    gf(l), l = Vt(() => e(...i), t);
  };
}, xf = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, Vi = {}, ji = (e) => We(ke(crypto.randomUUID(), /-/g, ""), 0, e - 1), Rl = (e = 8) => {
  let t = ji(e);
  for (; t in Vi; ) t = ji(C(t) + 1);
  return Vi[t] = !0, "b" + t;
}, rs = (e, ...t) => console[e]("Brio.js", ...t), jt = (...e) => rs("warn", "warn:", we, ...e), $ = (...e) => rs(xi, `detected an ${xi}:`, we, ...e), wi = (e, t = At) => ze(t.querySelectorAll(e)), te = (e, t = At) => v(e) ? wi(e, t)[0] : e, ye = (e, t, ...l) => e[t](...l), ss = (e) => e[Vs](!0), fs = (e, t) => I(ze(e.attributes), ({ name: l, [m]: i }) => t(l, i)), ct = (e) => e[Ve](), Nl = (e) => e[ef], as = (e) => ie(e[Ye] || ""), il = (e) => [...e.childNodes], q = (e, t) => e[bs](t), Ci = (e, t, l, i) => {
  i && (e[i] = l), e[sf](t, l);
}, Di = (e, t) => e[lf](t), Al = (e, ...t) => e[jr].add(...t), Gl = (e, ...t) => e[jr][Ve](...t), Xi = requestAnimationFrame, Et = (e) => Xi(() => Xi(e)), Vl = (e, t) => At[Qs](e, t), mi = (e) => At[qs](e), Be = (e) => _e(e.tagName || ""), le = (e, t, l, i) => (e = te(e), e[Ws](t, l, i), () => e[rf](t, l)), He = (e, t, l) => te(e).dispatchEvent(new CustomEvent(_e(ke(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [Dr]: l
})), yl = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of il(l && Be(e) == pe ? e[fi] : e))
      await yl(i, t, l);
}, Lf = (e) => e[fe][El] = !0, $f = (e) => {
  let t = e[fe];
  t[El] && (t[El] = !1, He(t, Y));
}, Uf = (e) => de.getComputedStyle(e), Mf = (e) => {
  let t = Uf(e);
  return !(!Nl(e) || t[Ms] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, Ut = (e = "", t = $i) => new URL(e, pl[$i])[t], ns = (e) => $t(Ut(e), pl.origin), cs = (e) => U(["src", m, be, G + "ed"], e), vf = (e) => ke(ke(e, /[^\w-]/g, ""), /^[^a-z_]+/i, ""), qi = (e) => `only supports ${Ne(We(e, 0, -1), ", ")}, and ${e[C(e) - 1]} insertions`, Bf = (e) => async (t, l, i, r) => {
  let n = Cl + ":", a = l == V ? Ye : l, f = [Ht, ft, Yl, rl, Pt, wt, V], E = () => ls(f, (_) => _ == l);
  if (!E())
    return $(n, qi(f));
  let s = te(t);
  if (!rt(s))
    return $(n, fe, Oe, Tl, fl);
  if (te(ni) == s)
    return $(n, fe, "cannot be the", ci, Le);
  if (f = [wt, Yl, rl], (te(xr) == s || te(Ls) == s) && !E())
    return $(n, or(Be(s)), Le, qi(f));
  i = await i;
  let c = e[pe];
  i in c && (i = c[i]);
  let o = a == Ye, u = i, N = !1;
  if (!o && v(i) && (u = Vl("div"), u[mt] = i, N = !0), !o && !rt(u))
    return $(n, fi, Oe, Tl, fl, "or", Pe);
  let R = Ie(r, br);
  if (!o && R && v(R) && (u = te(R, u), !rt(u)))
    return $(n, Le, Mr);
  let O = e.gc[Kt];
  if (a == Pt) await O(s, !1);
  else if (o || a == wt)
    for (let _ of il(s)) await O(_, !1);
  let S = N ? il(u) : [u];
  if (ye(s, o ? wt : a, ...S), o && (S = il(s)), I(S, (_) => {
    let D = [];
    Be(_) == b ? P(D, _) : De(_) && P(D, ...wi(b, _)), I(D, (x) => {
      if (_i([Ai, yr, Or, _r], (k) => ae(q(x, k)))) {
        let k = Vl(b);
        fs(x, (Q, w) => Ci(k, Q, w, cs(Q) && Q)), k[mt] = x[mt], ye(x, Pt, k);
      }
    });
  }), Ie(r, _l, !0)) {
    let [_] = e.bnode;
    for (let D of S) {
      if (De(D)) {
        let x = _(D, s);
        await gl(x);
      }
      await e.gc[Wt](D, s);
    }
  }
  return S;
}, $l = (e, t = "", l = "") => {
  let i = t == ht ? FormData : URLSearchParams, r = new i(), n = (a, f = "") => {
    Ee(a) || M(a) ? I(qe(a), ([E, s]) => {
      let c = f ? `${f}[${E}]` : E;
      n(s, c);
    }) : r[rl](f, a);
  };
  return n(e, l), r;
}, _t = (e) => async (t, l, i = {}) => {
  let r = "status", n = Cr + "-Type", a = Ie(i, "parser");
  if (Ee(l)) {
    let f = i[Yi] || {}, E = Oi(Re(f), (c) => _e(c) == _e(n)), s = _e(f[E] || "");
    Xe(f, E), e == Yt || e == H ? (t += $l(l), l = ce) : di(s, "json") ? (l = hr(l), f[n] = "application/json") : di(s, "form-data") ? l = $l(l, ht) : l = $l(l), i[Yi] = f;
  }
  try {
    let f = await fetch(t, { ...i, [Fs]: e, body: l }), E = await f[a || V]();
    if (!a)
      try {
        E = ti(E);
      } catch {
      }
    if (!f.ok) {
      let s = new Error(`HTTP ${f[r]}! Status text: ` + f.statusText);
      throw s.response = f, s[fi] = E, s;
    }
    return E;
  } catch (f) {
    throw f;
  }
}, jl = {
  get: _t(Yt),
  post: _t(Ys),
  put: _t(Hr),
  [Bi]: _t(Bi),
  [H]: _t(H)
}, Ff = (e, t) => [
  // Set a route
  (l, i) => {
    if (ve(i)) {
      l = Ut(l, ul);
      let r = dt(re(l, "/"), ie), n = C(r) - 1, a = e;
      I(r, (f, E) => {
        f in a || (a[f] = {}), a = a[f], E == n && (a[Dt] = i);
      });
    } else $(Ir, "set route without a", al, ml, we, l);
  },
  /**
   * Get a route function by path.
   * 
   * @returns The route function, or `undefined` if not found, or `null` if not the same origin
   */
  (l) => {
    if (!ns(l))
      return Rt;
    l = Ut(l, ul);
    let i = dt(re(l, "/"), ie), r = e, n = {}, a = 0;
    for (let f of i) {
      if (a = 0, f in r && !$t(f, ":"))
        r = r[f], a = 1;
      else for (let E of Re(r))
        if ($t(E, ":")) {
          let [s, c] = dt(re(E, ":"), ie);
          if (!c || c && c in t && t[c](f)) {
            let o = n[s];
            o ? M(o) ? P(o, f) : n[s] = [o, f] : n[s] = f, r = r[E], a = 1;
            break;
          }
        }
      if (!a) break;
    }
    if (a = a && r[Dt] ? 1 : 0, a)
      return () => r[Dt]({
        params: n,
        path: l,
        [Ve]: () => Xe(r, Dt)
      });
  }
], Es = (e, t) => {
  e = Ut(e, ul), t && ns(e) ? (t(), e != pl[ul] && history.pushState(Rt, "", e)) : pl.href = e;
}, Hf = (e) => Pi(({ [ee]: t, prop: l }) => (vt(t)[j].add(l), e)), Xl = !1, ql = [], Ts = (e) => (ql = [], Xl = !0, e({}), Xl = !1, [...ql]), us = (e) => {
  let t = Ts(e), l = C(t), [i, r] = t[l - 1] || [];
  return [i, r];
}, Te = (e, t) => {
  if (!Qi(e) || Tt(e)) return e;
  let l = {
    get(a, f) {
      return Xl && (W(a, f) || !(f in a)) && P(ql, [i, f]), Ot.get(a, f, i);
    },
    set(a, f, E) {
      f in a || z(a, f);
      let s = i[f];
      if (s === E) return !0;
      let c = vt(i), o = {
        [fe]: a,
        [ee]: i,
        prop: f,
        [It]: s
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      Si(o, "wc"), Ct.has(E) && (Ct[H](E), E = E(o)), r.has(f) || (E = Te(E)), o[it] = E, kf(o);
      let u = Ot.set(a, f, E, i);
      return Ji(c, o), u;
    },
    [ki](a, f) {
      let E = a[f], s = Ot[ki](a, f);
      return Ji(vt(i), {
        [fe]: a,
        [ee]: i,
        prop: f,
        [It]: E,
        [it]: ce,
        [ui]: H
      }), s;
    },
    [zl](a, f, E) {
      let s = E[m], c = i[f];
      return Ct.has(s) && (E[m] = s({ [ee]: i, prop: f, [it]: s, [It]: c })), !r.has(f) && m in E && (E[m] = Te(E[m])), Ot[zl](a, f, E);
    }
  };
  const i = new Proxy(Tt(t) && Ee(t) ? Df(t, e) : e, l), r = Gt();
  let n = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [ee]: ue(),
    [he]: {},
    skip: r
    // refs: [],
    // [ON_SET]: {},
  };
  Pl.set(i, n);
  for (let a in e) {
    let f = e[a];
    Ct.has(f) && (f = f({
      [fe]: e,
      [ee]: i,
      prop: a,
      [It]: ce
    })), !r.has(a) && Qi(f) && Ot.set(e, a, f, i);
  }
  return i;
}, Qi = (e) => M(e) || Ee(e), Ji = (e, t) => {
  let l = ue(), i = e[he][t.prop];
  i && I(i, (n, a) => l.set(a, n)), I(e[ee], (n, a) => l.set(a, n));
  let r = ze(l);
  hf(r, Nf);
  for (let [n] of r) n(t);
}, kf = (e) => {
  e[ui] = ol(e[It]) ? kt : ol(e[it]) ? H : Kr;
}, os = "getItem", ps = "setItem", Ql = ue(), Yf = (e) => {
  let t = Pf(e);
  return t && W(t, os) && W(t, ps);
}, Jl = (e, t) => ti(e[os](t) || ""), Zi = (e, t, l) => e[ps](t, hr(l)), bi = (e) => "_b_" + e, hs = (e, t, l) => Yf(e) ? (l && (l = bi(l), W(e, l) && (t = Jl(e, l))), Pi(({ [ee]: r, prop: n }) => (Ql.set(l, [r, n, e]), l = l || bi(n), W(e, l) ? t = Jl(e, l) : Zi(e, l, t), Vt(() => Lt(r, n, () => {
  Zi(e, l, r[n]);
})), t))) : $(Ei, hi, zt), zf = (e) => {
  if (Ql.has(e.key)) {
    let [t, l, i] = Ql.get(e.key);
    i === e[af] && (t[l] = Jl(i, e.key));
  }
}, Mt = (e, t, l = 0) => {
  let i = [], r = Ts(t || e);
  return I(r, ([n, a]) => {
    P(i, Ns(n, a, e, l));
  }), t && e({}), () => I(i, (n) => n());
}, Lt = (e, t, l, i = 0) => {
  let r;
  return Tt(e) ? v(t) || Ce(t) ? r = Ns(e, t, l, i) : r = Rs(e, l, i) : ($(Ir + `watch non-${ee} ${zt}/${at}.`), r = () => {
  }), r;
}, Pl = ue(), Ct = Gt(), Pi = (e) => Ct.add(e) && e, Tt = (e) => Pl.has(e), vt = (e) => Pl.get(e), Zl = (e) => Pl[H](e), Rs = (e, t, l = 0) => {
  if (Tt(e)) {
    let i = vt(e)[ee];
    return i.set(t, l), () => i[H](t);
  }
}, Ns = (e, t, l, i = 0) => {
  let r = vt(e)[he];
  r[t] || (r[t] = ue()), r[t].set(l, i);
  let n = e[t], a;
  return Tt(n) && (a = Rs(n, l, i)), () => {
    a && a(), r[t][H](l);
  };
};
z(Te, "persist", (e, t) => hs(localStorage, e, t), "wc");
z(Te, "session", (e, t) => hs(sessionStorage, e, t), "wc");
z(Te, "init", Pi, "wc");
z(Te, j, Hf, "wc");
let As = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), Kf = (e, t) => t ? li(e) : Bt(e), Wf = (e, t = "", l = !0) => (gs(e) && !l && (e += `(${t})`), pr(e) || (e = Kf(e, l == V), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), Ul = "required", er = "matches", tr = "\\p{L}", Gf = "\\p{Nd}", Vf = df(vl(vl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, tr + Gf), /l/, tr), "u"), jf = (e) => {
  let t = {}, l = {};
  e || (e = {});
  let i = (s, c, o) => {
    let u = !1;
    return (v(s) || M(s)) && (u = o ? C(s) >= c : C(s) <= c), Ce(s) && (u = o ? s >= c : s <= c), u;
  }, r = {
    [Ul]: (s) => !!s || s === 0,
    min: (s, c) => i(s, c, !0),
    max: (s, c) => i(s, c, !1),
    [tl]: (s) => v(s) && ne(s, Vf),
    same: (s, c, o) => s === o[c],
    in: (s, c) => M(c) && U(c, s),
    [er]: (s, c) => v(s) && ne(s, c),
    type: (s, c) => r.in(Ke(s), M(c) ? c : [c])
  }, n = {
    [Ul]: (s) => Z(s, "is", Ul + "."),
    min: (s, c) => Z(s, Oe, "at least", c + "."),
    max: (s, c) => Z(s, Oe, "at most", c + "."),
    [tl]: (s) => Z(s, Oe, Nr, tl + "."),
    same: (s, c) => Z(s, "must match", c + "."),
    in: (s, c) => Z(s, Oe, "equal to", Ne(c, " or ") + "."),
    [er]: (s) => s + " has an invalid format.",
    type: (s, c) => Z(s, Oe, Tl, (M(c) ? Ne(c, " or ") : c) + ".")
  }, a = (s, c) => {
    t[s] = c;
  }, f = (s, c, o) => {
    r[s] = c, o && (n[s] = o);
  }, E = () => {
    Ii(l);
    for (let [s, c] of qe(t)) {
      let o = e[s];
      for (let u of c) {
        let N = "", R = "", O = "";
        v(u) ? N = u : Ee(u) && (N = u[Ur], R = u[m], O = u[$r]);
        let S = r[N];
        if (!S) {
          jt("Unknown rule: " + N);
          continue;
        }
        S(o, R, e) || (l[s] || (l[s] = []), O ? P(l[s], O) : P(l[s], n[N](s, R, e) || s + " is invalid."));
      }
    }
    return !gt(l);
  };
  return {
    prop: a,
    rule: f,
    [nf]: E,
    errors: l
  };
}, lr = /^[a-z_$][\w$]*$/i, Xf = (e, t = !1) => {
  let l = Gt(), i = 1, r = t ? 1 : 0, n = "", a = /('|"|`|\${|}|[a-z_$][\w$]*)/gi, f;
  for (; (f = a.exec(e)) !== null; ) {
    let E = f[Lr], s = e[E - 1] || "";
    if (s == "\\")
      continue;
    let c = f[0];
    n ? c == n && (n = "") : c == "'" || c == '"' ? n = c : c == "`" ? i += i <= r ? 1 : -1 : c == "${" || c == "}" ? r += c == "}" ? -1 : 1 : i > 0 && i == r && s != "." && l.add([c, E, E + C(c)]);
  }
  return l;
}, qf = (e, t, l = !1) => {
  let i = Xf(t, l), r = "", n = 0, a = e.ctx;
  for (let [f, E, s] of i)
    for (let c of [lt, nl, cl, Rr])
      if (a[c] && f in a[c]) {
        r += We(t, n, E) + `${c}.${f}`, n = s;
        break;
      }
  return r + We(t, n);
}, Dt = If(Zt), ys = [];
Gt();
let Za = () => {
  let e = (T) => o.get(T), t = (T, p = () => !0) => {
    let h = T ? Nl(T) : Rt;
    for (; h; ) {
      let A = e(h);
      if (A && p(A)) return A;
      h = Nl(h);
    }
  }, l = (T, p) => {
    let h = e(T);
    if (!h) {
      let A = p && e(p) || t(p || T);
      h = {
        // Local context
        // @ts-ignore
        ctx: { ...B },
        // A reference to the element. Convenience for internal use.
        el: T,
        [Il]: A,
        // Unique ID context
        id: Ie(A, "id", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: [],
        /**
         * Skip the hydration process
         * - 0: not hydrated (default)
         * - 1: skip self
         * - 2: skip children
         * - 3: skip self and children
         */
        [j]: 0,
        ...L
      };
      for (let y in D) {
        let g = D[y](h, A);
        g && z(h.ctx, y, g, "c");
      }
      o.set(T, h), h[Ue] = Zf(h, K + Ue)();
    }
    return h;
  }, i = async (T, p) => {
    v(T) && (T = te(T)), v(p) && (p = te(p)), rt(p) || (p = ce), rt(T) && (await f(T), await yl(T, async (h) => {
      let A = !1, y = T == h ? p : ce;
      return Sf(h) && as(h) ? A = n(h, y) : De(h) && (Be(h) == b && ae(q(h, Ai)) ? A = !1 : A = await a(h, y)), A;
    }));
  }, r = async (T, p = !0, h = !0) => {
    await yl(T, async (A) => {
      let y = e(A);
      if (y) {
        if (y[nt])
          for (let g of y[nt])
            await r(g, p, h);
        if (y[tt])
          for (let g of y[tt])
            await r(g, p, h);
        y.ph && ct(y.ph), I(y.cFns, (g) => g()), h && o[H](A);
      }
      return p && ct(A), !0;
    });
  }, n = (T, p) => {
    let h = T[Ye], A = ta(Bt(h || ""));
    if (A && ne(A, bf)) {
      let y = l(T, p), g = c(y, A, "", V);
      d(y, Mt(() => T[Ye] = g(y.ctx))), bl(y, V, h);
    }
    return !1;
  }, a = async (T, p) => {
    let h = l(T, p);
    if (me(h, 3)) return !0;
    for (let [A, y] of u) {
      let g = [];
      if (_f(A))
        fs(T, (oe, Xt) => {
          ne(oe, A) && P(g, [oe, Xt]);
        });
      else {
        let oe = q(T, A);
        ae(oe) || P(g, [A, oe]);
      }
      for (let [oe, Xt] of g) {
        if (me(h, 1) || me(h, 3)) break;
        bl(h, oe, Xt), await y(h, oe, Bt(Xt));
      }
      if (me(h, 1) || me(h, 3)) break;
    }
    return me(h, 0) && (h[j] = 1), gt(h[se]) || o[H](T), !me(h, 2) && !me(h, 3);
  }, f = async (T) => {
    let p = await Os(T, Or, []);
    I(p, ([h, A]) => {
      let y = Be(A), g = y != b && y != ge ? pe : y, oe = A[g == pe ? Qr : mt];
      L[g][h] = ie(oe);
    });
  }, E = (T) => (p, h) => {
    L[T][p] = h;
  }, s = (T, p, h = "", A = !0) => {
    let y;
    return p = Wf(qf(T, p, A != V), h, A), p in _ ? y = _[p] : (y = Rl(), S[y] = As(_s(T, p), p), _[p] = y), y;
  }, c = (T, p, h = "", A = !0) => {
    let y;
    try {
      let g = p in S ? p : s(T, p, h, A);
      y = S[g](T.ctx);
    } catch (g) {
      $(g[$r]), y = () => Dt;
    }
    return y;
  }, o = ue(), u = [], N = {}, R = {}, O = { [J]: ds }, S = {}, _ = {}, D = {
    // The $data context
    [nl]: ir(nl, Me),
    // Reactive properties defined in the element or inherited from the parent context
    [cl]: ir(cl, K + he, !0),
    // The $for context
    [lt]: (T, p) => p == null ? void 0 : p.ctx[lt],
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [Bl]: rr(Bl),
    [Fl]: rr(Fl),
    // The element itself
    $el: (T) => T.el,
    // Unique identifier for the element
    $id: (T) => T.id,
    $cleanup: (T) => (p) => d(T, p)
  }, [x, k] = Ff(R, O), Q = (T) => Es(T, k(T)), w = {
    [al]: x,
    [Wi]: E(Wi + "s"),
    [pe]: E(pe),
    [ge]: E(ge),
    [b]: E(b),
    [he]: E(he),
    data: E(ht),
    mask: E(zi),
    [qr]: E(Ki)
  }, B = {
    [Rr]: Te({}),
    $set: w,
    [Wt]: i,
    [Kt]: r
  }, F = {
    http: jl,
    state: Te,
    watch: Lt,
    effect: Mt,
    [al]: Q,
    emit: He,
    listen: le,
    /** Get the local context of an element */
    context: (T) => {
      var p;
      return (p = e(te(T))) == null ? void 0 : p.ctx;
    },
    // Tools
    hasProp: W,
    getProp: Ie,
    setProp: z,
    sync: xt,
    [wr]: xe,
    [cf]: jf,
    uid: Rl,
    getType: Ke
  };
  I(Re(F), (T) => B[pt + T] = F[T]);
  let L = {
    [pe]: N,
    [ge]: {},
    [b]: {},
    [he]: {},
    data: {},
    // ! HYDRATION
    [Xr]: u,
    bnodes: o,
    [zi]: {},
    [Ki]: {},
    routes: R,
    routeRules: O,
    // ! PUBLIC CONTEXT
    gc: B,
    exec: c,
    bnode: [l, e]
  };
  return B[Cl] = Bf(L), P(ys, k), I([w, jl, B, L], (T) => Si(T, "wc")), L;
}, me = (e, t) => e[j] == t, d = (e, t) => {
  P(e.cFns, t);
}, ut = (e, t) => {
  let l = e[Il];
  l && (l[tt] || (l[tt] = []), U(l[tt], t) || P(l[tt], t));
}, Qf = (e) => Oi(ot(e), (t) => Nl(t)), ot = (e) => {
  let t = [], [, l] = e.bnode;
  return e.ph && P(t, e.ph), I(e[nt] || [e.el], (i) => {
    let r = l(i);
    r && W(r.attr, Dl) ? P(t, ...ot(r)) : P(t, i);
  }), t;
}, Jf = (e) => {
  I(ot(e), (t) => {
    t != e.ph && ct(t);
  });
}, Zf = (e, t, l = "{}") => {
  let i = De(e.el) ? q(e.el, t) : null;
  return ae(i) || bl(e, t, i), i = Bt(i || l), e.exec(e, i);
}, bl = (e, t, l) => {
  e[se][t] = l, De(e.el) && Di(e.el, t);
}, Bt = (e) => ke(Ne($e(re(e, we), (t) => $t(ie(t), "//") ? "" : t), we), /;$/, ""), bf = /\${((?!.*\${).*?)}/, ea = /{{((?!.*{{).*?)}}/, ta = (e, t = "${$1}") => vl(e, ea, t), ir = (e, t, l) => (i, r) => {
  let n = i.el, a = r ? r.ctx[e] : Rt, f = De(n), E = f && !ae(q(n, t)), s = f && (i[se][Se] || !ae(q(n, Se))), c = f && (!a || E);
  return c && !E && t == Me && Ci(n, Me, ""), c && !s ? Te({}, l && a) : a || {};
}, rr = (e) => (t, l) => !l || De(t.el) && !ae(q(t.el, Me)) ? {} : l.ctx[e], la = () => {
  let e = Ut();
  Es(e, Oi(ys, (t) => t(e)));
}, ba = (e = {}) => {
  Zt in de || (Si(e, "wc"), z(de, Zt, e, "wc"), le(de, hi, zf), le(de, "pop" + ee, la)), He(de, Zt);
}, dl = (e) => (e.match(/^(b-\w+|bind|on)(-([\w-$]+))?$/) || [])[3] || "", gl = async (e) => {
  await sr(e, _r), await sr(e, ri);
}, sr = async (e, t) => {
  let l = t == ri, i = e.ctx[l ? Bl : Fl], r = l ? [
    /*B_IF,*/
    Ar,
    Dl,
    Me
  ] : [Me];
  for (let n of e[nt] || [e.el]) {
    let a = await Os(n, t, r);
    I(a, ([f, E]) => {
      i[f] = l ? E : E[Qr], d(e, () => Xe(i, f));
    });
  }
}, Os = async (e, t, l) => {
  let i = [], r = t != ri;
  return await yl(e, (n) => {
    if (De(n)) {
      if (ls(l, (f) => !ae(q(n, f)))) return !1;
      let a = q(n, t);
      a && (Di(n, t), P(i, [a, n]), r && ct(n));
    }
    return !0;
  }, r), i;
}, _s = (e, t) => "{" + Ne(dt(Re(e.ctx), (l) => U(t, l)), ",") + "}", yt = (e, t, l) => {
  let i = e.exec(e, t);
  d(e, Mt(() => l(i)));
}, Ss = (e, t, l) => {
  let i = [];
  return l && (l in t ? P(i, t[l]) : (l = e.exec(e, l)(), M(l) && I(l, (r) => {
    r in t && P(i, t[r]);
  }))), i;
}, ia = async (e, t) => {
  e[j] = 3;
}, ra = [yr, ia], sa = (e, t, l) => {
  let i = e.el, [r, n] = e.bnode;
  e[j] = 3;
  let [a, f] = $e(re(l, " in "), ie), [E, s] = $e(re(a, ","), ie);
  s || (s = Lr);
  let c = Z("the", t, Ge, wl);
  if (!ne(E, lr) || !ne(s, lr))
    return $(c, Nr, "alias.");
  let o = e.exec(e, f), [u, N] = us(o), R = u ? u[N] : o(), O = u && Tt(R), S = !1;
  if (Ce(R) && (R = Te(Gi(R, 1)), S = !0, u && Mt(() => {
    let w = u[N] || 0;
    Ce(w) && xt(R, Gi(w, 1));
  }, () => u[N])), !(M(R) || Ee(R)))
    return $(c, `an ${at}, ${zt}, or ${J}.`);
  e.ph = mi(t), ye(i, Pt, e.ph), ut(e, i);
  let _ = {}, D = async ([w, B]) => {
    let F = ss(i);
    ye(e.ph, Ht, F);
    let L = r(F, i);
    L[se][t] = "", W(e[se], Se) && (L[se][Se] = "");
    let T = Te({}, L.ctx[lt]);
    z(T, E, B, "c"), z(T, s, w, "c"), z(L.ctx, lt, T, "c"), d(L, () => {
      Zl(T);
    }), d(L, Lt(T, s, ({ [it]: p }) => {
      let h = _[w][1];
      p !== h && (T[s] = h);
    })), O && d(L, Lt(T, E, () => {
      R[T[s]] = T[E];
    })), _[w] = [F, w], await gl(L), await e.gc[Wt](F, i);
  }, x = ([w, B]) => {
    let F = _[w], L = n(F && F[0]);
    if (L) {
      let T = L.ctx[lt];
      T[E] = B, T[s] = w, F[1] = w;
    }
  }, k = ([w, B]) => {
    let [F] = _[w];
    e.gc[Kt](F), Xe(_, w);
  }, Q = {
    [kt]: D,
    [Kr]: x,
    [H]: k
  };
  for (let w of qe(R))
    D(w);
  u && d(e, Lt(R, ce, ({ [ui]: w, prop: B, [it]: F }) => {
    Q[w]([B, F]);
  })), d(e, () => {
    for (let w in _)
      k([Number(w), null]);
    S && Zl(R);
  });
}, fa = [Ar, sa], Is = async (e, t, l) => {
  let i = t == Me, r = i ? nl : cl, n = e[i ? ht : he][l], a = e[Il] || e;
  !ve(n) && l && (n = e.exec(a, l)());
  let f = ve(n) ? await n(a.ctx) : {};
  if (!Ee(f))
    return e[j] = 3, $(ts(Ge, t, "an " + zt, Ke(f)));
  for (let E in f) z(e.ctx[r], E, f[E], mf(f, E));
  i && await gl(e), d(e, () => {
    Vt(() => {
      Zl(e.ctx[r]);
    });
  });
}, aa = [K + he, Is], na = [Me, Is], fr = {}, ca = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!M(i) || !_i(i, v))
      return $("the", t, Ge, Oe, `an ${at} of ${Pe}(s).`);
    e.id = i.reduce((r, n) => {
      let a = Rl(5);
      return fr[a] = !0, z(r, n, a, "wc"), r;
    }, {}), d(e, () => {
      for (let r in e.id) Xe(fr, e.id[r]);
    });
  }
}, Ea = ["b-id", ca], ws = (e) => (t, l, i) => {
  if (!(W(t[se], Dl) || W(t[se], Gr) && e == V)) {
    t[j] = 2;
    let r = t[pe];
    i in r && (i = li(i)), i && yt(t, i, async (n) => {
      await t.gc[Cl](t.el, e, n()), t[j] = 3;
    });
  }
}, Ta = [Gr, ws(wt)], ua = [Gs, ws(V)], oa = async (e, t, l) => {
  let i = e.el, r = l ? e[pe][l] || e.exec(e, l)() : i[mt];
  e[j] = 2, v(r) ? (e[nt] = await e.gc[Cl](i, Ht, ie(r)), ut(e, i), ct(i)) : jt(t + ":", Ei, m, we, r);
}, pa = [Dl, oa], ha = async (e, t, l) => {
  let i = e.el;
  e[j] = 2;
  let r = Ss(e, e[b], l);
  if (Be(i) == b) {
    ut(e, i);
    let n = q(i, "src"), a = n ? await jl.get(n) : as(i);
    a && P(r, Bt(a)), ct(i);
  }
  for (let n of r) {
    let a = n;
    if (v(a)) {
      let f = pr(a);
      a = As(_s(e, a), a, f), f && (a = a(e.ctx));
    }
    ve(a) && await a(e.ctx);
  }
}, Ra = [Ai, ha], Na = (e, t, l) => {
  let i = e.el;
  if (l && Be(i) != ge) {
    let r = Ss(e, e[ge], l), n = Rl();
    Al(i, n);
    let a = Vl(ge);
    ye(i, ft, a), a[Ye] = Ne(r, we), a[Ye] = Aa(a, "." + n), e.gc[Wt](a, i), d(e, () => {
      e.gc[Kt](a);
    });
  }
}, Aa = (e, t) => {
  var i;
  let l = [];
  for (let r of ((i = e.sheet) == null ? void 0 : i.cssRules) || []) {
    let n = r[of];
    P(l, ke(r.cssText, n, t + " " + n));
  }
  return Ne(l, we);
}, ya = [K + ge, Na], Oa = (e, t, l) => {
  let i = l, r, n = e.ctx.$ref;
  i in n && (i = li(i)), yt(e, i, (a) => {
    i = a(), M(i) && ([i, r] = i), v(i) && i in n && (i = n[i]), U([Ht, ft, Yl, rl], r) || (r = ft), rt(i) ? (ye(i, r, ...ot(e)), ut(e, e.el)) : jt(Yr, Le, Mr, t + `="${l}"`);
  });
}, _a = [K + Yr, Oa], Ol = ue(), Sa = (e, t, l) => {
  if (e[nt]) return;
  if (!(W(e[se], Se) ? Se : W(e[se], bt) ? bt : ""))
    return $("the", t, Ge, Oe, "used with", Se, "or", bt + ".");
  let [r, n] = e.exec(e, l)(), a = wa(e.el, r, n);
  Ol.set(e.el, a), d(e, a[Ve]), d(e, () => Ol[H](e.el));
}, Ia = [K + ll, Sa], ar = (e, t, l, i, r) => {
  Gl(e, t, l, r), Al(e, i), Et(() => {
    Al(e, r), Gl(e, i);
  });
}, nr = (e, t, l, i, r) => {
  Gl(e, t, l), Al(e, i, r);
}, cr = () => (/* @__PURE__ */ new Date()).getTime(), wa = (e, t, l) => {
  let [i, r] = t, [n, a] = l;
  if (!De(e))
    return $(Ei, ll, Le, e);
  let f = null, E = 1, s = 2, c = 3, o = 4, u = E, N = 0, R = le(e, ll + "run", (x) => {
    x[fe] === e && (N = cr());
  }), O, S = le(e, ll + Pr, (x) => {
    x[fe] === e && (u == s ? u = o : u == c && (u = E), O && O());
  }), _ = () => {
    R(), S();
  }, D = (x, k) => {
    O = k;
    let Q = cr();
    x && f && u == o || !x && f === !1 && u == o || (x ? f === !1 && u == s ? (u = c, ar(e, i, r, n, a)) : (f = !0, u = s, ar(e, n, a, i, r)) : f === null ? (f = !1, u = o, O && O()) : f && u == s ? (u = c, nr(e, n, a, i, r)) : (f = !1, u = s, nr(e, i, r, n, a)), Vt(() => {
      N < Q && O && O();
    }, 50));
  };
  return z(D, Ve, _), D;
}, Ca = (e, t, l) => {
  let i = e.el;
  e.ph = mi(t), ye(i, Pt, e.ph), e[j] = 3, ut(e, i);
  let [r] = e.bnode, n, a, f = () => {
    e.gc[Kt](n.el), n = ce;
  };
  yt(e, l, (E) => {
    let s = E();
    Et(async () => {
      if (s) {
        if (!n) {
          let c = ss(i);
          ye(e.ph, ft, c), n = r(c, i), n[se][Se] = "", await gl(n), await e.gc[Wt](c, i), ut(e, c);
        }
        a = Ol.get(n.el), a && a(!0);
      } else !s && n && (a ? a(!1, f) : f());
    });
  });
}, Da = [Se, Ca], St = ue(), ma = (e, t, l) => {
  e.ph = mi(t), ye(Qf(e), Ht, e.ph);
  let i, r = () => {
    Jf(e), St.set(e.ph, e);
  };
  yt(e, l, (n) => {
    let a = n();
    Et(() => {
      let f = ot(e);
      if (i = Ol.get(e.el), a) {
        if (St.has(e.ph)) {
          for (let E of f)
            if (St.has(E) && E !== e.ph) {
              let s = St.get(E), c = ot(s);
              f = dt(f, (o) => !U(c, o) || o === s.ph);
            }
          St[H](e.ph), ye(e.ph, ft, ...f);
        }
        i && i(!0);
      } else i ? i(!1, r) : r();
    });
  });
}, Pa = [bt, ma], qt = (e, t, l) => {
  let i = dl(t), [r] = re(i, "-"), n = e[Ue][t] || {}, a = e.el, f = e.exec(e, l, "$entry", !1), E = hl(f, n[sl] || 100), s = new IntersectionObserver((c) => {
    I(c, (o) => {
      o.isIntersecting != (r == gr) && (E(o), n[Hs] && s[Hl]());
    });
  }, n);
  s[vr](a), d(e, () => s[Hl]());
}, da = [
  [Ui, qt],
  [K + Ui, qt],
  [Mi, qt],
  [K + Mi, qt]
], Er = (e, t, l) => {
  let i = dl(t);
  re(i, "-");
  let r = e.el, n = e[Ue][t] || {}, a = n[ai] ? te(ni) : r, f = e.exec(e, l, "$size", !1), E = hl(f, n[sl] || 100), s = new ResizeObserver((c) => {
    let o = c[0].borderBoxSize[0];
    E([o.inlineSize, o.blockSize]);
  });
  s[vr](a, n), d(e, () => s[Hl]());
}, ga = [
  [vi, Er],
  [K + vi, Er]
], Je = "keyup", Ze = "keydown", Tr = "outside", xa = "window", Cs = "control", ei = "meta", Qt = "arrow", ur = [
  ei,
  Cs,
  "shift",
  "alt",
  "fn"
], La = {
  ctrl: Cs,
  cmd: ei,
  [zs]: ei,
  esc: "escape",
  del: H,
  up: Qt + "up",
  down: Qt + "down",
  left: Qt + "left",
  right: Qt + "right"
}, $a = (e, t, l) => {
  let i = dl(t), [r, ...n] = re(i, "-"), a = e.el, f = a, E = (R) => {
    let O = e.exec(e, l, pt + Li, !1);
    ve(O) ? O(R) : $(ts(Li, t, "a " + ml, Ke(O())));
  }, s = e[Ue][t] || {};
  I(n, (R) => {
    s[R] = !0;
  }), sl in s && (E = hl(E, s[sl])), Hi in s && (E = xf(E, s[Hi])), s[Tr] || s[ai] ? f = At : s[xa] && (f = de);
  let c = {};
  U([Ze, Je], r) && I(Ie(s, "keys", []), (R) => {
    c[La[R] || R] = !0;
  });
  let o = gt(c), u = r;
  if (U([Ze, Je], r) && o) {
    let R = {};
    r = t;
    let O = hl((S) => {
      He(f, r, S);
    }, 600);
    d(e, le(f, Ze, (S) => {
      let _ = _e(S.key);
      R[_] || (R[_] = !0), Vt(() => {
        R.meta && !U(ur, _) && Ml(S, R);
      });
      let D = Re(R);
      o > 1 && Je == u && R.meta && !U(ur, _) ? O(D) : Ze == u && He(f, r, D);
    })), d(e, le(f, Je, (S) => {
      Ze == u && Ml(S, R), He(f, r, Re(R)), Je == u && Ml(S, R);
    })), d(e, le(f, "focus", () => {
      Ii(R);
    }));
  }
  d(e, le(f, r, (R) => {
    if (s[Br] && R[tf](), s.stop && R.stopPropagation(), !(s.self && R[fe] !== R.currentTarget) && !(s[Tr] && (a.contains(R[fe]) || !Mf(a)))) {
      if (U([Ze, Je], u)) {
        let O = R[Dr];
        if (!(gt(c) == gt(O) && _i(Re(c), (S) => U(O, S))))
          return;
      }
      E(R);
    }
  }, s));
}, Ml = (e, t) => Xe(t, _e(e.key)), Ua = [/^(b-on|on)-([\w-$]+)$/, $a], Ma = (e, t, l) => {
  let i = e.el, r = dl(t), n = l || xs(r);
  r = vf(r);
  let a = q(i, r), f = e[Ue][t] || {};
  yt(e, n, (E) => {
    if (!E)
      return jt(pf(t), yi(t + `="${l}"`), we, i);
    let s = E(a || ""), c = f.prop || cs(r) && r;
    s || c ? Ci(i, r, !c && s === !0 ? "" : s, c) : Di(i, r);
  });
}, va = [/^(b-bind|bind)-([\w-$]+)$/, Ma], Jt = ue(), Ba = (e, t, l) => {
  let i = Z("the", t, Ge), r = Z(wl, "a reactive", m), n = G + "ed", a = t + `="${l}"`, f = e.el, E = Be(f), s = f.type;
  if (!U([Y, et, G], E))
    return $(i, Sr, Y, `, ${et}, and ${G} ${Le}s.`, a, f);
  let [c, o] = us(e.exec(e, l));
  if (!c)
    return $(i, r, a, f);
  let u = c[o], N, R = () => ze(E == G ? f[Ue] : x()), O = e[Ue][t] || {}, S = (T) => {
    let p = T[ae(q(T, m)) && D ? be : m], h = Jt.get(T) || O;
    if (v(p) && (h.trim && (p = ie(p)), !h.raw)) {
      let A = ti(p);
      (Ce(A) || ae(A) || Of(A)) && (p = A);
    }
    return p;
  }, _ = (T) => E == Y && U(T, s), D = _([Qe, Fi]), x = () => wi(Y + `[type="${Qe}"][name="${f.name}"]`), k = () => _(Qe) && C(x()) > 1, Q = () => {
    let T = [
      [Y, Qe, [J, Pe, el, at]],
      [Y, Fi, [J, Pe, el]],
      [Y, J, [J]],
      [Y, "range", [J]],
      [Y, "", [J, Pe]],
      [et, "", [J, Pe]],
      [G, "", [J, Pe, el, at]]
    ];
    for (let [p, h, A] of T)
      if (E == p && (!h || s == h)) {
        ae(u) || ol(u) || U(A, Ke(u)) || jt(i, r, Tl, Ne(A, " or "), `for ${E == Y ? s + " " : ""}${p} ${Le}s,`, yi(Ke(u)), a, f);
        break;
      }
  };
  Et(() => {
    Q(), G == E ? I(R(), (T) => Jt.set(T, O)) : _(Qe) && Jt.set(f, O);
  });
  let w = () => {
    if (u = c[o], N = S(f), U([Y, et], E))
      if (s == Qe && M(u))
        f[be] = U(u, N);
      else if (D)
        f[be] = u === N;
      else {
        if (f[El] || At.activeElement === f && u === N) return;
        u !== N && (f[m] = u);
      }
    else E == G && (M(u) ? I(R(), (T) => {
      T[n] = U(u, S(T));
    }) : f[m] = u);
  };
  Et(() => d(e, Mt(w)));
  let B = {}, F = () => {
    if (u = c[o], E == G && f.multiple || k()) {
      let T = [];
      I(R(), (p) => {
        E == G && Jt.set(p, O), (p[n] || p[be]) && P(T, S(p));
      }), c[o] = T;
    } else c[o] = D && !f[be] ? !1 : S(f);
  };
  (_([V, "search", "url", "tel", tl, "password"]) || E == et) && (B[js] = Lf, B[Xs] = $f);
  let L = O.lazy || D || E == G ? "change" : Y;
  B[L] = F;
  for (let [T, p] of qe(B))
    d(e, le(f, T, p));
}, Fa = ["b-model", Ba], X = "output", Fe = "cursor", st = Fe + "Updated", Ha = "updateCursor", ka = (e, t, l) => {
  let i = e.el;
  if (!(m in i && Ll in i))
    return $("the", t, Ge, Sr, et, Le + "s and textual", Y, "types (text, email, etc.).");
  let r = {
    exp: e.exec(e, l, "$mask"),
    [m]: "",
    [Fe]: i[Ll],
    [Ha]: Ft,
    [st]: !1,
    [X]: "",
    char: xl,
    letter: Va,
    number: Ds,
    alpha: ja,
    money: Wa
  }, n = () => {
    r[m] = i[m], r[m] != r[X] && (r[Fe] = i[Ll], Ya(r), i[m] = r[X], i.setSelectionRange(r[Fe], r[Fe]), He(i, Sl, r));
  };
  Et(n), d(e, le(i, Y, n, !0));
}, Ya = (e) => {
  e[st] = !1, e[X] = "";
  let t = e.exp(e);
  if (ve(t)) {
    t(e);
    return;
  }
  let l = e[m], i = 0, r = C(l);
  I([...t], (n, a) => {
    v(n) && C(n) > 1 && t.splice(a, 1, ...re(n, ""));
  });
  for (let [n, a] of qe(t)) {
    if (i >= r) break;
    if (M(a)) {
      let f = 0, [E, s, c] = a;
      for (; i < r && f < c; ) {
        if (E(l[i]))
          f++, e[X] += l[i];
        else {
          let o = !1, u, N = n;
          for (; N > -1 && (u = za(t, N + 1)); ) {
            if (Ka(u, l, i)) {
              o = !0;
              break;
            }
            N = Rf(t, u, N);
          }
          if (o && f >= s) break;
        }
        i++, Ft(e, i);
      }
    } else v(a) && (e[X] += a, l[i] == a && i++, Ft(e, i));
  }
}, za = (e, t) => {
  for (let l = t; l < C(e); l++) {
    let i = e[l];
    if (M(i))
      return i;
  }
}, Ka = (e, t, l) => {
  let i = !1;
  if (M(e)) {
    let [r, n, a] = e;
    if (ve(r) && Ce(n) && Ce(a)) {
      let f = 0, E = C(t);
      for (let s = l; s < E && f < a; s++)
        r(t[s]) && f++;
      i = f > 0 && f >= n;
    }
  }
  return i;
}, Wa = (e = {}) => (t) => {
  let l = t[m], i = C(l), r = Ie(e, "thousands", ","), n = Ie(e, "decimal", "."), a = Ie(e, "precision", 2);
  n == "," && (r = "."), r == "." && (n = ",");
  let f = !1, E = !1, s = [], c = [], [o] = Ds();
  for (let N = 0; N < i; N++)
    l[N] == "-" ? !C(s) && !C(c) && (f = !0) : E ? C(c) < a && o(l[N]) && P(c, N) : l[N] == n ? E = !0 : o(l[N]) && (C(s) == 1 && l[s[0]] == "0" ? s[0] = N : P(s, N));
  t[X] = f ? "-" : "";
  let u = C(s);
  t[st] = !1;
  for (let N = 0; N < u; N++)
    N > 0 && (u - N) % 3 == 0 && (t[X] += r), t[X] += l[s[N]], Ft(t, s[N] + 1);
  t[X] += E ? n : "";
  for (let N = 0; N < C(c); N++)
    t[X] += l[c[N]], Ft(t, c[N] + 1);
  return t;
}, Ft = (e, t) => {
  if (!e[st]) {
    let l = e[Fe];
    l == 0 ? e[st] = !0 : l <= t && (e[st] = !0, e[Fe] = C(e[X]));
  }
}, Ga = (e = 1, t = 1) => (e = Ce(e) && e >= 0 ? e : 1, t = Ce(t) && t > e ? t : e > 0 ? e : 1, [e, t]), xl = (e, t, l) => [v(e) ? (r) => r == e : (r) => ne(r, e), ...Ga(t, l)], Va = (e, t) => xl(new RegExp("\\p{L}", "u"), e, t), Ds = (e, t) => xl(new RegExp("\\p{Nd}", "u"), e, t), ja = (e, t) => xl(/[\p{L}\p{Nd}]/u, e, t), Xa = [K + Sl, ka], qa = async (e, t, l) => {
  yt(e, l, (i) => {
    let r = i();
    ve(r) && r();
  });
}, Qa = ["b-effect", qa], Ja = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  ra,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  Da,
  /**
   * Context directives
   * Notes:
   * - the order of inference is: $for, $data, $props, $store
   * - b-slot and b-ref are hydrated after b-data
   */
  aa,
  na,
  /** List rendering
   * Notes:
   * - b-for stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  fa,
  /**
   * Unique ID generator
   */
  Ea,
  /**
   * Run one or more scripts on the element, right after the context ($props, $data, $slot, $ref, $for, $id) is set up.
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  Ra,
  /**
   * Static template hydration
   * Notes:
   * - the inner HTML of the element is used as a template and it may include more than one root element
   * - the element that contains the b-template directive is removed from the DOM and its content is inserted in its place
   *   and because of that:
   *   - the b-template directive SHOULD NOT be used with elements that are self-closing (e.g. <img />, <input />, etc.)
   *   - the b-template directive CANNOT be used with: b-html, b-text, b-style, bind-*, b-model, b-mask, b-transition, on-*
   *     this is because these directives need to be hydrated on the element itself and not on its content
   *   - the b-template directive CAN be used with: b-ignore, b-props, b-data, b-ref, b-slot, b-if, b-for, b-id, b-script, b-show, b-teleport, b-effect
   */
  pa,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  Pa,
  // ['b-boost', hydrateBoost],
  Ia,
  // b-transition, b-transition-play, b-transition-reverse
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  _a,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Ta,
  ua,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  ya,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
   * - The `b-mask` directive is used to format an input value using a mask
   */
  va,
  // [b-bind|bind]-[attributeName]
  Fa,
  Xa,
  /**
   * Event directives
   */
  ...da,
  // [b-on|on]-enter, [b-on|on]-exit
  ...ga,
  // [b-on|on]-resize
  Ua,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  Qa
], en = (e) => {
  I(Ja, (t) => P(e[Xr], t));
};
export {
  va as bindDirective,
  na as dataDirective,
  fa as forDirective,
  Ta as htmlDirective,
  Ea as idDirective,
  Da as ifDirective,
  ra as ignoreDirective,
  da as intersectionDirectives,
  Xa as maskDirective,
  Fa as modelDirective,
  Za as newApp,
  Ua as onDirective,
  aa as propsDirective,
  ga as resizeDirectives,
  Ra as scriptDirective,
  en as setAllDirectives,
  ba as setup,
  Pa as showDirective,
  ya as styleDirective,
  _a as teleportDirective,
  pa as templateDirective,
  Ia as transitionDirective
};
//# sourceMappingURL=briojs.2.0.0.js.map
