let Q = (e) => e.trim(), Se = (e) => e.toLowerCase(), se = (e, t, l) => e.split(t, l), Rr = (e) => e.toUpperCase(), ms = (e) => Rr(e[0]) + Fe(e, 1), ds = (e) => Se(e[0]) + Fe(e, 1), nt = (e, t, l) => e[Tf](t, l), Yl = (e, t, l) => e[ef](t, l), Ee = (e, t) => t.test(e), ke = (e, t, l) => e[yi](t, l), kl = (e, t, l) => {
  for (; Ee(e, t); )
    e = ke(e, t, l);
  return e;
}, gs = (e) => Ee(e, /^\d+$/), xs = (e) => Ee(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !nt(e, v + " "), hr = (e) => Ee(Q(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), Ls = (e) => ds(Ne($e(se(e, "-"), ms), "")), yr = (e) => JSON.stringify(e), si = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, fi = (e) => "`" + e + "`", b = (...e) => Ne(e, " "), el = "brio", yt = "$", rt = "$for", zl = "$ref", Kl = "$slot", Nr = "$store", Et = "after", sl = "append", ct = "array", fe = "attr", ai = "Attribute", Ar = "a valid", k = "b-", _r = "b-for", Ie = "b-if", Or = "b-ignore", ni = "b-ref", Sr = "b-save", tl = "b-show", Ir = "b-slot", Kt = "before", $s = "body", ll = "boolean", wr = "can only be used on", Pr = "Cannot ", Ze = "checkbox", tt = "checked", Ms = "Child", Us = "class", Cr = "clone", Ei = "composi", ci = "content", Dr = "Content", Gt = "create", Nt = "data", fl = "debounce", mr = "detail", dr = "define", v = "delete", Ve = "directive", Gl = "disconnect", Bs = "display", oi = "document", Le = "element", il = "email", gr = "end", Li = "entries", $i = "error", Mi = "event", xr = "EventListener", Lr = "exit", We = "get", $r = "head", Ui = "href", Ti = "html", ui = "HTML", Pl = "hydrate", Mr = "index", Fs = "inner", vs = "insert", pi = "Invalid", Vl = "length", Cl = "mask", Ur = "message", Hs = "method", pe = "must be", Pe = `
`, st = "newValue", Br = "name", al = "Node", ot = "nodes", Fr = "not found.", At = null, Z = "number", _t = "object", vr = "observe", Dt = "oldValue", Ri = "on-", Bi = Ri + "enter", Fi = Ri + Lr, vi = Ri + "resize", Ys = "once", hi = "operation", Me = "options", ks = "outer", Dl = "parent", Hi = "patch", zs = "post", Wl = "prepend", Hr = "prevent", Yr = "Propert", je = Yr + "y", he = "props", kr = "put", Yi = "radio", Xe = "remove", yi = "replace", ml = "requires", nl = "route", ee = "script", j = "skip", V = "select", te = "state", zr = "start", Ni = "storage", de = "string", ie = "style", Ks = "super", Kr = "teleport", Re = "template", W = "text", ki = "throttle", Ai = "tion", Gs = "toString", xt = "transition", Gr = "type", ce, Vr = "update", Wr = "valid", C = "value", _i = "With", Vs = "add" + xr, El = yt + Nt, Vt = "$de" + Pl, Wt = yt + Pl, dl = yt + vs, cl = yt + he, Ue = k + Nt, jr = k + Ti, Oi = k + ee, gl = k + Re, Ws = k + W, Xr = Ms + "ren", js = Us + "List", Xs = Cr + al, ol = Ei + "ng", qs = Ei + Ai + zr, Qs = Ei + Ai + gr, Js = Gt + "Comment", Zs = Gt + "Element", jl = dr + je, bs = dr + Yr + "ies", it = "de" + Pl + Xr, zi = v + je, qr = Ve + "s", ef = "ends" + _i, xl = "func" + Ai, tf = We + ai, lf = We + je + "Value", rf = We + je + "Priority", Ki = $r + "ers", Lt = Fs + ui, H = "in" + kr, Gi = Cl + "s", Qr = Cl + "Token", Vi = Qr + "s", Tl = "of " + Gr, Jr = ks + ui, Zr = "Own" + je, sf = Dl + al, ul = "path" + Br, ff = Hr + "Default", br = "proto" + Gr, af = Xe + ai, nf = Xe + xr, Ef = Xe + je, $t = yi + _i, mt = yi + Xr, Wi = nl + "Rule", Bl = V + "ionStart", es = V + "or", cf = "set" + ai, of = "set" + je, Tf = zr + "s" + _i, uf = Ni + "Area", ae = "tar" + We, lt = W + "area", ze = W + Dr, pf = Wr + "ate", Rf = Wr + "ator", hf = "async" + xl, ts = We + Zr + "Descriptor", yf = ts + "s", Nf = "has" + Zr, Af = es + "Text", ls = (e, t, l, i) => `the ${e} ${t} ${ml} ${l}, ` + Si(i), Si = (e) => `but got ${e} instead.`, _f = (e) => b(e, ml, "a reactive", C), D = (e, ...t) => e.push(...t), Of = (e, t) => e.sort(t), Ne = (e, t) => e.join(t), I = (e, t) => e.forEach(t), $e = (e, t, l) => e.map(t, l), Mt = (e, t, l) => e.filter(t, l), Ii = (e, t, l) => e.find(t, l), wi = (e, t, l) => e.every(t, l), is = (e, t, l) => e.some(t, l), Sf = (e, t, l) => e.indexOf(t, l), If = (e, t) => t[1] - e[1], Ke = (e) => Array.from(e), ji = (e, t = 0) => $e(Ke({ [Vl]: e }), (l, i) => t + i), Ge = (e) => Se(Fe(Ae[br][Gs].call(e), 8, -1)), qe = (e, t) => Ge(e) === t, ne = (e) => e === At, pl = (e) => e === ce, X = (e) => qe(e, _t), $ = (e) => qe(e, ct), Be = (e) => wf(e) || Pf(e), wf = (e) => qe(e, xl), Pf = (e) => qe(e, hf), U = (e) => qe(e, de), Ce = (e) => qe(e, Z) && !isNaN(e), Cf = (e) => qe(e, ll), Df = (e) => Ot(e, rs), Ot = (e, t) => e instanceof t, ft = (e) => Ot(e, Node), mf = (e) => Ot(e, Text), De = (e) => Ot(e, HTMLElement), Xl = (e) => Ot(e, Map), ql = (e) => Ot(e, Set), ge = window, Ae = Object, wt = Reflect, Rl = location, St = ge[oi], df = Symbol, rs = RegExp, z = (e, t) => Ae[br][Nf].call(e, t), we = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, Qe = (e, t) => delete e[t], gf = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], Y = (e, t, l = ce, i = "") => {
  if (U(i)) {
    let r = i;
    i = { [C]: l }, I(gf, ([n, a]) => {
      i[a] = !M(r, n);
    });
  }
  Ae[jl](e, t, i);
}, Ut = (e) => P(ye(e)), ye = (e) => Ae.keys(e), xf = (e = At) => Ae[Gt](e), Lf = (e, t = {}) => {
  const l = xf(e);
  return Ae[bs](
    l,
    Ae[yf](t)
  ), l;
}, $f = (e, t, l = Ae) => l[ts](e, t), Mf = (e) => Ae.getPrototypeOf(e), Pi = (e, t = {}) => {
  I(ye(e), (l) => {
    Y(e, l, e[l], t);
  });
}, Ci = (e) => I(ye(e), (t) => {
  Qe(e, t);
}), Te = (e = ce) => new Map(e), jt = (e = ce) => new Set(e), Uf = (e, t) => new rs(e, t), Bt = (e, t) => {
  if (e === t) return e;
  if ($(e) && $(t)) {
    for (; P(e) > P(t); ) e.pop();
    for (let l = 0; l < P(t); l++)
      l < P(e) ? e[l] = Bt(e[l], t[l]) : e.push(xe(t[l]));
  } else if (Xl(e) && Xl(t)) {
    let l = Te(e);
    e.clear();
    for (let [i, r] of Je(t))
      e.set(i, l.has(i) ? Bt(l.get(i), r) : xe(r));
  } else if (ql(e) && ql(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (X(e) && X(t)) {
    let l = { ...e };
    Ci(e);
    for (let i in t)
      z(t, i) && (e[i] = z(l, i) ? Bt(l[i], t[i]) : xe(t[i]));
  } else
    return t;
  return e;
}, xe = (e) => {
  let t = e;
  if (X(e)) {
    let l = {};
    for (let i in e)
      z(e, i) && (l[i] = xe(e[i]));
    t = l;
  }
  return $(e) && (t = $e(e, xe)), Xl(e) && (t = Te($e(Ke(Je(e)), ([l, i]) => [l, xe(i)]))), ql(e) && (t = jt($e(Ke(e), xe))), t;
}, M = (e, t, l) => e.includes(t, l), Je = (e) => X(e) ? Ae[Li](e) : e[Li](), Fe = (e, t, l) => e.slice(t, l), P = (e) => pl(e[Vl]) ? e.size : e[Vl], Xt = (e, t = 0) => setTimeout(e, t), Bf = (e) => {
  clearTimeout(e);
}, hl = (e, t) => {
  let l;
  return (...i) => {
    Bf(l), l = Xt(() => e(...i), t);
  };
}, Ff = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, Xi = {}, qi = (e) => Fe(ke(crypto.randomUUID(), /-/g, ""), 0, e - 1), yl = (e = 8) => {
  let t = qi(e);
  for (; t in Xi; ) t = qi(P(t) + 1);
  return Xi[t] = !0, "b" + t;
}, ss = (e, ...t) => console[e]("Brio.js", ...t), qt = (...e) => ss("warn", "warn:", Pe, ...e), x = (...e) => ss($i, `detected an ${$i}:`, Pe, ...e), Di = (e, t = St) => Ke(t.querySelectorAll(e)), le = (e, t = St) => U(e) ? Di(e, t)[0] : e, _e = (e, t, ...l) => e[t](...l), fs = (e) => e[Xs](!0), as = (e, t) => I(Ke(e.attributes), ({ name: l, [C]: i }) => t(l, i)), Tt = (e) => e[Xe](), Nl = (e) => e[sf], ns = (e) => Q(e[ze] || ""), rl = (e) => [...e.childNodes], J = (e, t) => e[tf](t), mi = (e, t, l, i) => {
  i && (e[i] = l), e[cf](t, l);
}, di = (e, t) => e[af](t), vf = (e, ...t) => e[js].add(...t), Qi = requestAnimationFrame, ut = (e) => Qi(() => Qi(e)), Ql = (e, t) => St[Zs](e, t), gi = (e) => St[Js](e), ve = (e) => Se(e.tagName || ""), re = (e, t, l, i) => (e = le(e), e[Vs](t, l, i), () => e[nf](t, l)), Ye = (e, t, l) => le(e).dispatchEvent(new CustomEvent(Se(ke(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [mr]: l
})), Al = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of rl(l && ve(e) == Re ? e[ci] : e))
      await Al(i, t, l);
}, Hf = (e) => e[ae][ol] = !0, Yf = (e) => {
  let t = e[ae];
  t[ol] && (t[ol] = !1, Ye(t, H));
}, kf = (e) => ge.getComputedStyle(e), zf = (e) => {
  let t = kf(e);
  return !(!Nl(e) || t[Bs] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, vt = (e = "", t = Ui) => new URL(e, Rl[Ui])[t], Es = (e) => nt(vt(e), Rl.origin), cs = (e) => M(["src", C, tt, V + "ed"], e), Kf = (e) => ke(ke(e, /[^\w-]/g, ""), /^[^a-z_]+/i, ""), Gf = (e) => {
  let t = {};
  for (let l of e)
    t[l] = e[lf](l), e[rf](l) == Ol && (t[l] += " !" + Ol);
  return t;
}, _l = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (nt(i, xt) ? t : l)[i] = e[i];
  return [t, l];
}, Ol = "important", Vf = (e, t, l) => {
  let i = "";
  Yl(l + "", "!" + Ol) && (l = Q(Fe(l, 0, -10)), i = Ol), e[ie][of](t, l, i);
}, Wf = (e, t) => {
  e[ie][Ef](t);
}, Sl = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Vf(e, i, l[i]);
}, Il = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Wf(e, i);
}, Ji = (e) => `only supports ${Ne(Fe(e, 0, -1), ", ")}, and ${e[P(e) - 1]} insertions`, jf = (e) => async (t, l, i, r) => {
  let n = dl + ":", a = l == W ? ze : l, f = [Kt, Et, Wl, sl, $t, mt, W], E = () => is(f, (O) => O == l);
  if (!E())
    return x(n, Ji(f));
  let s = le(t);
  if (!ft(s))
    return x(n, ae, pe, Tl, al);
  if (le(Ti) == s)
    return x(n, ae, "cannot be the", ui, Le);
  if (f = [mt, Wl, sl], (le($r) == s || le($s) == s) && !E())
    return x(n, Rr(ve(s)), Le, Ji(f));
  i = await i;
  let c = e[Re];
  i in c && (i = c[i]);
  let p = a == ze, T = i, y = !1;
  if (!p && U(i) && (T = Ql("div"), T[Lt] = i, y = !0), !p && !ft(T))
    return x(n, ci, pe, Tl, al, "or", de);
  let h = we(r, es);
  if (!p && h && U(h) && (T = le(h, T), !ft(T)))
    return x(n, Le, Fr);
  let S = e.gc[Vt];
  if (a == $t) await S(s, !1);
  else if (p || a == mt)
    for (let O of rl(s)) await S(O, !1);
  let A = y ? rl(T) : [T];
  if (_e(s, p ? mt : a, ...A), p && (A = rl(s)), I(A, (O) => {
    let m = [];
    ve(O) == ee ? D(m, O) : De(O) && D(m, ...Di(ee, O)), I(m, (K) => {
      if (wi([Oi, Or, Sr, Ir], (G) => ne(J(K, G)))) {
        let G = Ql(ee);
        as(K, (Oe, w) => mi(G, Oe, w, cs(Oe) && Oe)), G[Lt] = K[Lt], _e(K, $t, G);
      }
    });
  }), we(r, Pl, !0)) {
    let [O] = e.bnode;
    for (let m of A) {
      if (De(m)) {
        let K = O(m, s);
        await Ml(K);
      }
      await e.gc[Wt](m, s);
    }
  }
  return A;
}, Fl = (e, t = "", l = "") => {
  let i = t == Nt ? FormData : URLSearchParams, r = new i(), n = (a, f = "") => {
    X(a) || $(a) ? I(Je(a), ([E, s]) => {
      let c = f ? `${f}[${E}]` : E;
      n(s, c);
    }) : r[sl](f, a);
  };
  return n(e, l), r;
}, Pt = (e) => async (t, l, i = {}) => {
  let r = "status", n = Dr + "-Type", a = we(i, "parser");
  if (X(l)) {
    let f = i[Ki] || {}, E = Ii(ye(f), (c) => Se(c) == Se(n)), s = Se(f[E] || "");
    Qe(f, E), e == We || e == v ? (t += Fl(l), l = ce) : Yl(s, "json") ? (l = yr(l), f[n] = "application/json") : Yl(s, "form-data") ? l = Fl(l, Nt) : l = Fl(l), i[Ki] = f;
  }
  try {
    let f = await fetch(t, { ...i, [Hs]: e, body: l }), E = await f[a || W]();
    if (!a)
      try {
        E = si(E);
      } catch {
      }
    if (!f.ok) {
      let s = new Error(`HTTP ${f[r]}! Status text: ` + f.statusText);
      throw s.response = f, s[ci] = E, s;
    }
    return E;
  } catch (f) {
    throw f;
  }
}, Jl = {
  get: Pt(We),
  post: Pt(zs),
  put: Pt(kr),
  [Hi]: Pt(Hi),
  [v]: Pt(v)
}, Xf = (e, t) => [
  // Set a route
  (l, i) => {
    if (Be(i)) {
      l = vt(l, ul);
      let r = Mt(se(l, "/"), Q), n = P(r) - 1, a = e;
      I(r, (f, E) => {
        f in a || (a[f] = {}), a = a[f], E == n && (a[gt] = i);
      });
    } else x(Pr, "set route without a", nl, xl, Pe, l);
  },
  /**
   * Get a route function by path.
   * 
   * @returns The route function, or `undefined` if not found, or `null` if not the same origin
   */
  (l) => {
    if (!Es(l))
      return At;
    l = vt(l, ul);
    let i = Mt(se(l, "/"), Q), r = e, n = {}, a = 0;
    for (let f of i) {
      if (a = 0, f in r && !nt(f, ":"))
        r = r[f], a = 1;
      else for (let E of ye(r))
        if (nt(E, ":")) {
          let [s, c] = Mt(se(E, ":"), Q);
          if (!c || c && c in t && t[c](f)) {
            let p = n[s];
            p ? $(p) ? D(p, f) : n[s] = [p, f] : n[s] = f, r = r[E], a = 1;
            break;
          }
        }
      if (!a) break;
    }
    if (a = a && r[gt] ? 1 : 0, a)
      return () => r[gt]({
        params: n,
        path: l,
        [Xe]: () => Qe(r, gt)
      });
  }
], os = (e, t) => {
  e = vt(e, ul), t && Es(e) ? (t(), e != Rl[ul] && history.pushState(At, "", e)) : Rl.href = e;
}, qf = (e) => xi(({ [te]: t, prop: l }) => (Yt(t)[j].add(l), e)), Zl = !1, bl = [], Ts = (e) => (bl = [], Zl = !0, e({}), Zl = !1, [...bl]), us = (e) => {
  let t = Ts(e), l = P(t), [i, r] = t[l - 1] || [];
  return [i, r];
}, oe = (e, t) => {
  if (!Zi(e) || pt(e)) return e;
  let l = {
    get(a, f) {
      return Zl && (z(a, f) || !(f in a)) && D(bl, [i, f]), wt.get(a, f, i);
    },
    set(a, f, E) {
      f in a || Y(a, f);
      let s = i[f];
      if (s === E) return !0;
      let c = Yt(i), p = {
        [ae]: a,
        [te]: i,
        prop: f,
        [Dt]: s
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      Pi(p, "wc"), dt.has(E) && (dt[v](E), E = E(p)), r.has(f) || (E = oe(E)), p[st] = E, Qf(p);
      let T = wt.set(a, f, E, i);
      return bi(c, p), T;
    },
    [zi](a, f) {
      let E = a[f], s = wt[zi](a, f);
      return bi(Yt(i), {
        [ae]: a,
        [te]: i,
        prop: f,
        [Dt]: E,
        [st]: ce,
        [hi]: v
      }), s;
    },
    [jl](a, f, E) {
      let s = E[C], c = i[f];
      return dt.has(s) && (E[C] = s({ [te]: i, prop: f, [st]: s, [Dt]: c })), !r.has(f) && C in E && (E[C] = oe(E[C])), wt[jl](a, f, E);
    }
  };
  const i = new Proxy(pt(t) && X(t) ? Lf(t, e) : e, l), r = jt();
  let n = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [te]: Te(),
    [he]: {},
    skip: r
    // refs: [],
    // [ON_SET]: {},
  };
  Ll.set(i, n);
  for (let a in e) {
    let f = e[a];
    dt.has(f) && (f = f({
      [ae]: e,
      [te]: i,
      prop: a,
      [Dt]: ce
    })), !r.has(a) && Zi(f) && wt.set(e, a, f, i);
  }
  return i;
}, Zi = (e) => $(e) || X(e), bi = (e, t) => {
  let l = Te(), i = e[he][t.prop];
  i && I(i, (n, a) => l.set(a, n)), I(e[te], (n, a) => l.set(a, n));
  let r = Ke(l);
  Of(r, If);
  for (let [n] of r) n(t);
}, Qf = (e) => {
  e[hi] = pl(e[Dt]) ? Gt : pl(e[st]) ? v : Vr;
}, ps = "getItem", Rs = "setItem", ei = Te(), Jf = (e) => {
  let t = Mf(e);
  return t && z(t, ps) && z(t, Rs);
}, ti = (e, t) => si(e[ps](t) || ""), er = (e, t, l) => e[Rs](t, yr(l)), tr = (e) => "_b_" + e, hs = (e, t, l) => Jf(e) ? (l && (l = tr(l), z(e, l) && (t = ti(e, l))), xi(({ [te]: r, prop: n }) => (ei.set(l, [r, n, e]), l = l || tr(n), z(e, l) ? t = ti(e, l) : er(e, l, t), Xt(() => Ft(r, n, () => {
  er(e, l, r[n]);
})), t))) : x(pi, Ni, _t), Zf = (e) => {
  if (ei.has(e.key)) {
    let [t, l, i] = ei.get(e.key);
    i === e[uf] && (t[l] = ti(i, e.key));
  }
}, Ht = (e, t, l = 0) => {
  let i = [], r = Ts(t || e);
  return I(r, ([n, a]) => {
    D(i, Ns(n, a, e, l));
  }), t && e({}), () => I(i, (n) => n());
}, Ft = (e, t, l, i = 0) => {
  let r;
  return pt(e) ? U(t) || Ce(t) ? r = Ns(e, t, l, i) : r = ys(e, l, i) : (x(Pr + `watch non-${te} ${_t}/${ct}.`), r = () => {
  }), r;
}, Ll = Te(), dt = jt(), xi = (e) => dt.add(e) && e, pt = (e) => Ll.has(e), Yt = (e) => Ll.get(e), li = (e) => Ll[v](e), ys = (e, t, l = 0) => {
  if (pt(e)) {
    let i = Yt(e)[te];
    return i.set(t, l), () => i[v](t);
  }
}, Ns = (e, t, l, i = 0) => {
  let r = Yt(e)[he];
  r[t] || (r[t] = Te()), r[t].set(l, i);
  let n = e[t], a;
  return pt(n) && (a = ys(n, l, i)), () => {
    a && a(), r[t][v](l);
  };
};
Y(oe, "persist", (e, t) => hs(localStorage, e, t), "wc");
Y(oe, "session", (e, t) => hs(sessionStorage, e, t), "wc");
Y(oe, "init", xi, "wc");
Y(oe, j, qf, "wc");
let As = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), bf = (e, t) => t ? fi(e) : kt(e), ea = (e, t = "", l = !0) => (xs(e) && !l && (e += `(${t})`), hr(e) || (e = bf(e, l == W), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), vl = "required", lr = "matches", ir = "\\p{L}", ta = "\\p{Nd}", la = Uf(kl(kl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, ir + ta), /l/, ir), "u"), ia = (e) => {
  let t = {}, l = {};
  e || (e = {});
  let i = (s, c, p) => {
    let T = !1;
    return (U(s) || $(s)) && (T = p ? P(s) >= c : P(s) <= c), Ce(s) && (T = p ? s >= c : s <= c), T;
  }, r = {
    [vl]: (s) => !!s || s === 0,
    min: (s, c) => i(s, c, !0),
    max: (s, c) => i(s, c, !1),
    [il]: (s) => U(s) && Ee(s, la),
    same: (s, c, p) => s === p[c],
    in: (s, c) => $(c) && M(c, s),
    [lr]: (s, c) => U(s) && Ee(s, c),
    type: (s, c) => r.in(Ge(s), $(c) ? c : [c])
  }, n = {
    [vl]: (s) => b(s, "is", vl + "."),
    min: (s, c) => b(s, pe, "at least", c + "."),
    max: (s, c) => b(s, pe, "at most", c + "."),
    [il]: (s) => b(s, pe, Ar, il + "."),
    same: (s, c) => b(s, "must match", c + "."),
    in: (s, c) => b(s, pe, "equal to", Ne(c, " or ") + "."),
    [lr]: (s) => s + " has an invalid format.",
    type: (s, c) => b(s, pe, Tl, ($(c) ? Ne(c, " or ") : c) + ".")
  }, a = (s, c) => {
    t[s] = c;
  }, f = (s, c, p) => {
    r[s] = c, p && (n[s] = p);
  }, E = () => {
    Ci(l);
    for (let [s, c] of Je(t)) {
      let p = e[s];
      for (let T of c) {
        let y = "", h = "", S = "";
        U(T) ? y = T : X(T) && (y = T[Br], h = T[C], S = T[Ur]);
        let A = r[y];
        if (!A) {
          qt("Unknown rule: " + y);
          continue;
        }
        A(p, h, e) || (l[s] || (l[s] = []), S ? D(l[s], S) : D(l[s], n[y](s, h, e) || s + " is invalid."));
      }
    }
    return !Ut(l);
  };
  return {
    prop: a,
    rule: f,
    [pf]: E,
    errors: l
  };
}, rr = /^[a-z_$][\w$]*$/i, ra = (e, t = !1) => {
  let l = jt(), i = 1, r = t ? 1 : 0, n = "", a = /('|"|`|\${|}|[a-z_$][\w$]*)/gi, f;
  for (; (f = a.exec(e)) !== null; ) {
    let E = f[Mr], s = e[E - 1] || "";
    if (s == "\\")
      continue;
    let c = f[0];
    n ? c == n && (n = "") : c == "'" || c == '"' ? n = c : c == "`" ? i += i <= r ? 1 : -1 : c == "${" || c == "}" ? r += c == "}" ? -1 : 1 : i > 0 && i == r && s != "." && l.add([c, E, E + P(c)]);
  }
  return l;
}, sa = (e, t, l = !1) => {
  let i = ra(t, l), r = "", n = 0, a = e.ctx;
  for (let [f, E, s] of i)
    for (let c of [rt, El, cl, Nr])
      if (a[c] && f in a[c]) {
        r += Fe(t, n, E) + `${c}.${f}`, n = s;
        break;
      }
  return r + Fe(t, n);
}, gt = df(el), _s = [];
jt();
let En = () => {
  let e = (o) => p.get(o), t = (o, u = () => !0) => {
    let R = o ? Nl(o) : At;
    for (; R; ) {
      let N = e(R);
      if (N && u(N)) return N;
      R = Nl(R);
    }
  }, l = (o, u) => {
    let R = e(o);
    if (!R) {
      let N = u && e(u) || t(u || o);
      R = {
        // Local context
        // @ts-ignore
        ctx: { ...B },
        // A reference to the element. Convenience for internal use.
        el: o,
        [Dl]: N,
        // Unique ID context
        id: we(N, "id", {}),
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
      for (let _ in m) {
        let g = m[_](R, N);
        g && Y(R.ctx, _, g, "c");
      }
      p.set(o, R), R[Me] = na(R, k + Me)();
    }
    return R;
  }, i = async (o, u) => {
    U(o) && (o = le(o)), U(u) && (u = le(u)), ft(u) || (u = ce), ft(o) && (await f(o), await Al(o, async (R) => {
      let N = !1, _ = o == R ? u : ce;
      return mf(R) && ns(R) ? N = n(R, _) : De(R) && (ve(R) == ee && ne(J(R, Oi)) ? N = !1 : N = await a(R, _)), N;
    }));
  }, r = async (o, u = !0, R = !0) => {
    await Al(o, async (N) => {
      let _ = e(N);
      if (_) {
        if (_[ot])
          for (let g of _[ot])
            await r(g, u, R);
        if (_[it])
          for (let g of _[it])
            await r(g, u, R);
        _.ph && Tt(_.ph), I(_.cFns, (g) => g()), R && p[v](N);
      }
      return u && Tt(N), !0;
    });
  }, n = (o, u) => {
    let R = o[ze], N = oa(kt(R || ""));
    if (N && Ee(N, Ea)) {
      let _ = l(o, u), g = c(_, N, "", W);
      d(_, Ht(() => o[ze] = g(_.ctx))), ii(_, W, R);
    }
    return !1;
  }, a = async (o, u) => {
    let R = l(o, u);
    if (me(R, 3)) return !0;
    for (let [N, _] of T) {
      let g = [];
      if (Df(N))
        as(o, (ue, Qt) => {
          Ee(ue, N) && D(g, [ue, Qt]);
        });
      else {
        let ue = J(o, N);
        ne(ue) || D(g, [N, ue]);
      }
      for (let [ue, Qt] of g) {
        if (me(R, 1) || me(R, 3)) break;
        ii(R, ue, Qt), await _(R, ue, kt(Qt));
      }
      if (me(R, 1) || me(R, 3)) break;
    }
    return me(R, 0) && (R[j] = 1), Ut(R[fe]) || p[v](o), !me(R, 2) && !me(R, 3);
  }, f = async (o) => {
    let u = await Os(o, Sr, []);
    I(u, ([R, N]) => {
      let _ = ve(N), g = _ != ee && _ != ie ? Re : _, ue = N[g == Re ? Jr : Lt];
      L[g][R] = Q(ue);
    });
  }, E = (o) => (u, R) => {
    L[o][u] = R;
  }, s = (o, u, R = "", N = !0) => {
    let _;
    return u = ea(sa(o, u, N != W), R, N), u in O ? _ = O[u] : (_ = yl(), A[_] = As(Ss(o, u), u), O[u] = _), _;
  }, c = (o, u, R = "", N = !0) => {
    let _;
    try {
      let g = u in A ? u : s(o, u, R, N);
      _ = A[g](o.ctx);
    } catch (g) {
      x(g[Ur]), _ = () => gt;
    }
    return _;
  }, p = Te(), T = [], y = {}, h = {}, S = { [Z]: gs }, A = {}, O = {}, m = {
    // The $data context
    [El]: sr(El, Ue),
    // Reactive properties defined in the element or inherited from the parent context
    [cl]: sr(cl, k + he, !0),
    // The $for context
    [rt]: (o, u) => u == null ? void 0 : u.ctx[rt],
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [zl]: fr(zl),
    [Kl]: fr(Kl),
    // The element itself
    $el: (o) => o.el,
    // Unique identifier for the element
    $id: (o) => o.id,
    $cleanup: (o) => (u) => d(o, u)
  }, [K, G] = Xf(h, S), Oe = (o) => os(o, G(o)), w = {
    [nl]: K,
    [Wi]: E(Wi + "s"),
    [Re]: E(Re),
    [ie]: E(ie),
    [ee]: E(ee),
    [he]: E(he),
    data: E(Nt),
    mask: E(Gi),
    [Qr]: E(Vi)
  }, B = {
    [Nr]: oe({}),
    $set: w,
    [Wt]: i,
    [Vt]: r
  }, F = {
    http: Jl,
    state: oe,
    watch: Ft,
    effect: Ht,
    [nl]: Oe,
    emit: Ye,
    listen: re,
    /** Get the local context of an element */
    context: (o) => {
      var u;
      return (u = e(le(o))) == null ? void 0 : u.ctx;
    },
    // Tools
    hasProp: z,
    getProp: we,
    setProp: Y,
    sync: Bt,
    [Cr]: xe,
    [Rf]: ia,
    uid: yl,
    getType: Ge
  };
  I(ye(F), (o) => B[yt + o] = F[o]);
  let L = {
    [Re]: y,
    [ie]: {},
    [ee]: {},
    [he]: {},
    data: {},
    // ! HYDRATION
    [qr]: T,
    bnodes: p,
    [Gi]: {},
    [Vi]: {},
    routes: h,
    routeRules: S,
    // ! PUBLIC CONTEXT
    gc: B,
    exec: c,
    bnode: [l, e]
  };
  return B[dl] = jf(L), D(_s, G), I([w, Jl, B, L], (o) => Pi(o, "wc")), L;
}, me = (e, t) => e[j] == t, d = (e, t) => {
  D(e.cFns, t);
}, Rt = (e, t) => {
  let l = e[Dl];
  l && (l[it] || (l[it] = []), M(l[it], t) || D(l[it], t));
}, fa = (e) => Ii(ht(e), (t) => Nl(t)), ht = (e) => {
  let t = [], [, l] = e.bnode;
  return e.ph && D(t, e.ph), I(e[ot] || [e.el], (i) => {
    let r = l(i);
    r && z(r.attr, gl) ? D(t, ...ht(r)) : D(t, i);
  }), t;
}, aa = (e) => {
  I(ht(e), (t) => {
    t != e.ph && Tt(t);
  });
}, na = (e, t, l = "{}") => {
  let i = De(e.el) ? J(e.el, t) : null;
  return ne(i) || ii(e, t, i), i = kt(i || l), e.exec(e, i);
}, ii = (e, t, l) => {
  e[fe][t] = l, De(e.el) && di(e.el, t);
}, kt = (e) => ke(Ne($e(se(e, Pe), (t) => nt(Q(t), "//") ? "" : t), Pe), /;$/, ""), Ea = /\${((?!.*\${).*?)}/, ca = /{{((?!.*{{).*?)}}/, oa = (e, t = "${$1}") => kl(e, ca, t), sr = (e, t, l) => (i, r) => {
  let n = i.el, a = r ? r.ctx[e] : At, f = De(n), E = f && !ne(J(n, t)), s = f && (i[fe][Ie] || !ne(J(n, Ie))), c = f && (!a || E);
  return c && !E && t == Ue && mi(n, Ue, ""), c && !s ? oe({}, l && a) : a || {};
}, fr = (e) => (t, l) => !l || De(t.el) && !ne(J(t.el, Ue)) ? {} : l.ctx[e], Ta = () => {
  let e = vt();
  os(e, Ii(_s, (t) => t(e)));
}, cn = (e = {}) => {
  el in ge || (Pi(e, "wc"), Y(ge, el, e, "wc"), re(ge, Ni, Zf), re(ge, "pop" + te, Ta)), Ye(ge, el);
}, $l = (e) => (e.match(/^(b-\w+|bind|on)(-([\w-$]+))?$/) || [])[3] || "", Ml = async (e) => {
  await ar(e, Ir), await ar(e, ni);
}, ar = async (e, t) => {
  let l = t == ni, i = e.ctx[l ? zl : Kl], r = l ? [
    /*B_IF,*/
    _r,
    gl,
    Ue
  ] : [Ue];
  for (let n of e[ot] || [e.el]) {
    let a = await Os(n, t, r);
    I(a, ([f, E]) => {
      i[f] = l ? E : E[Jr], d(e, () => Qe(i, f));
    });
  }
}, Os = async (e, t, l) => {
  let i = [], r = t != ni;
  return await Al(e, (n) => {
    if (De(n)) {
      if (is(l, (f) => !ne(J(n, f)))) return !1;
      let a = J(n, t);
      a && (di(n, t), D(i, [a, n]), r && Tt(n));
    }
    return !0;
  }, r), i;
}, Ss = (e, t) => "{" + Ne(Mt(ye(e.ctx), (l) => M(t, l)), ",") + "}", It = (e, t, l) => {
  let i = e.exec(e, t);
  d(e, Ht(() => l(i)));
}, Is = (e, t, l) => {
  let i = [];
  return l && (l in t ? D(i, t[l]) : (l = e.exec(e, l)(), $(l) && I(l, (r) => {
    r in t && D(i, t[r]);
  }))), i;
}, ua = async (e, t) => {
  e[j] = 3;
}, pa = [Or, ua], Ra = (e, t, l) => {
  let i = e.el, [r, n] = e.bnode;
  e[j] = 3;
  let [a, f] = $e(se(l, " in "), Q), [E, s] = $e(se(a, ","), Q);
  s || (s = Mr);
  let c = b("the", t, Ve, ml);
  if (!Ee(E, rr) || !Ee(s, rr))
    return x(c, Ar, "alias.");
  let p = e.exec(e, f), [T, y] = us(p), h = T ? T[y] : p(), S = T && pt(h), A = !1;
  if (Ce(h) && (h = oe(ji(h, 1)), A = !0, T && Ht(() => {
    let w = T[y] || 0;
    Ce(w) && Bt(h, ji(w, 1));
  }, () => T[y])), !($(h) || X(h)))
    return x(c, `an ${ct}, ${_t}, or ${Z}.`);
  e.ph = gi(t), _e(i, $t, e.ph), Rt(e, i);
  let O = {}, m = async ([w, B]) => {
    let F = fs(i);
    _e(e.ph, Kt, F);
    let L = r(F, i);
    L[fe][t] = "", z(e[fe], Ie) && (L[fe][Ie] = "");
    let o = oe({}, L.ctx[rt]);
    Y(o, E, B, "c"), Y(o, s, w, "c"), Y(L.ctx, rt, o, "c"), d(L, () => {
      li(o);
    }), d(L, Ft(o, s, ({ [st]: u }) => {
      let R = O[w][1];
      u !== R && (o[s] = R);
    })), S && d(L, Ft(o, E, () => {
      h[o[s]] = o[E];
    })), O[w] = [F, w], await Ml(L), await e.gc[Wt](F, i);
  }, K = ([w, B]) => {
    let F = O[w], L = n(F && F[0]);
    if (L) {
      let o = L.ctx[rt];
      o[E] = B, o[s] = w, F[1] = w;
    }
  }, G = ([w, B]) => {
    let [F] = O[w];
    e.gc[Vt](F), Qe(O, w);
  }, Oe = {
    [Gt]: m,
    [Vr]: K,
    [v]: G
  };
  for (let w of Je(h))
    m(w);
  T && d(e, Ft(h, ce, ({ [hi]: w, prop: B, [st]: F }) => {
    Oe[w]([B, F]);
  })), d(e, () => {
    for (let w in O)
      G([Number(w), null]);
    A && li(h);
  });
}, ha = [_r, Ra], ws = async (e, t, l) => {
  let i = t == Ue, r = i ? El : cl, n = e[i ? Nt : he][l], a = e[Dl] || e;
  !Be(n) && l && (n = e.exec(a, l)());
  let f = Be(n) ? await n(a.ctx) : {};
  if (!X(f))
    return e[j] = 3, x(ls(Ve, t, "an " + _t, Ge(f)));
  for (let E in f) Y(e.ctx[r], E, f[E], $f(f, E));
  i && await Ml(e), d(e, () => {
    Xt(() => {
      li(e.ctx[r]);
    });
  });
}, ya = [k + he, ws], Na = [Ue, ws], nr = {}, Aa = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!$(i) || !wi(i, U))
      return x("the", t, Ve, pe, `an ${ct} of ${de}(s).`);
    e.id = i.reduce((r, n) => {
      let a = yl(5);
      return nr[a] = !0, Y(r, n, a, "wc"), r;
    }, {}), d(e, () => {
      for (let r in e.id) Qe(nr, e.id[r]);
    });
  }
}, _a = ["b-id", Aa], Ps = (e) => (t, l, i) => {
  if (!(z(t[fe], gl) || z(t[fe], jr) && e == W)) {
    t[j] = 2;
    let r = t[Re];
    i in r && (i = fi(i)), i && It(t, i, async (n) => {
      await t.gc[dl](t.el, e, n()), t[j] = 3;
    });
  }
}, Oa = [jr, Ps(mt)], Sa = [Ws, Ps(W)], Ia = async (e, t, l) => {
  let i = e.el, r = l ? e[Re][l] || e.exec(e, l)() : i[Lt];
  e[j] = 2, U(r) ? (e[ot] = await e.gc[dl](i, Kt, Q(r)), Rt(e, i), Tt(i)) : qt(t + ":", pi, C, Pe, r);
}, wa = [gl, Ia], Pa = async (e, t, l) => {
  let i = e.el;
  e[j] = 2;
  let r = Is(e, e[ee], l);
  if (ve(i) == ee) {
    Rt(e, i);
    let n = J(i, "src"), a = n ? await Jl.get(n) : ns(i);
    a && D(r, kt(a)), Tt(i);
  }
  for (let n of r) {
    let a = n;
    if (U(a)) {
      let f = hr(a);
      a = As(Ss(e, a), a, f), f && (a = a(e.ctx));
    }
    Be(a) && await a(e.ctx);
  }
}, Ca = [Oi, Pa], Da = (e, t, l) => {
  let i = e.el;
  if (l && ve(i) != ie) {
    let r = Is(e, e[ie], l), n = yl();
    vf(i, n);
    let a = Ql(ie);
    _e(i, Et, a), a[ze] = Ne(r, Pe), a[ze] = ma(a, "." + n), e.gc[Wt](a, i), d(e, () => {
      e.gc[Vt](a);
    });
  }
}, ma = (e, t) => {
  var i;
  let l = [];
  for (let r of ((i = e.sheet) == null ? void 0 : i.cssRules) || []) {
    let n = r[Af];
    D(l, ke(r.cssText, n, t + " " + n));
  }
  return Ne(l, Pe);
}, da = [k + ie, Da], ga = (e, t, l) => {
  let i = l, r, n = e.ctx.$ref;
  i in n && (i = fi(i)), It(e, i, (a) => {
    i = a(), $(i) && ([i, r] = i), U(i) && i in n && (i = n[i]), M([Kt, Et, Wl, sl], r) || (r = Et), ft(i) ? (_e(i, r, ...ht(e)), Rt(e, e.el)) : qt(Kr, Le, Fr, t + `="${l}"`);
  });
}, xa = [k + Kr, ga], wl = Te(), La = (e, t, l) => {
  if (e[ot]) return;
  if (!(z(e[fe], Ie) ? Ie : z(e[fe], tl) ? tl : ""))
    return x("the", t, Ve, pe, "used with", Ie, "or", tl + ".");
  let r = e.exec(e, l)();
  $(r) || (r = [r]);
  let [n, a] = r;
  if (!X(n))
    return x("the", t, pe, "an", _t + ".");
  X(a) || (a = n);
  let f = Ma(e.el, n, a);
  wl.set(e.el, f), d(e, f[Xe]), d(e, () => wl[v](e.el));
}, $a = [k + xt, La], Er = (e, t, l) => {
  let [i, r] = _l(t), [n, a] = _l(l);
  Il(e, r, i, n), Sl(e, a), ut(() => {
    Sl(e, n), Il(e, a);
  });
}, cr = (e, t, l) => {
  let [i, r] = _l(t), [n, a] = _l(l);
  Il(e, r, i), Sl(e, a, n);
}, or = () => (/* @__PURE__ */ new Date()).getTime(), Ma = (e, t, l) => {
  if (!De(e))
    return x(pi, xt, Le, e);
  let i = null, r = 1, n = 2, a = 3, f = 4, E = r, s = Gf(e[ie]), c = 0, p = re(e, xt + "run", (A) => {
    A[ae] === e && (c = or());
  }), T, y = re(e, xt + gr, (A) => {
    A[ae] === e && (E == n ? E = f : E == a && (E = r), Il(e, t, l), Sl(e, s), T && T());
  }), h = () => {
    p(), y();
  }, S = (A, O) => {
    T = O;
    let m = or();
    A && i && E == f || !A && i === !1 && E == f || (A ? i === !1 && E == n ? (E = a, Er(e, t, l)) : (i = !0, E = n, Er(e, l, t)) : i === null ? (i = !1, E = f, T && T()) : i && E == n ? (E = a, cr(e, l, t)) : (i = !1, E = n, cr(e, t, l)), Xt(() => {
      c < m && T && T();
    }, 50));
  };
  return Y(S, Xe, h), S;
}, Ua = (e, t, l) => {
  let i = e.el;
  e.ph = gi(t), _e(i, $t, e.ph), e[j] = 3, Rt(e, i);
  let [r] = e.bnode, n, a, f = () => {
    e.gc[Vt](n.el), n = ce;
  };
  It(e, l, (E) => {
    let s = E();
    ut(async () => {
      if (s) {
        if (!n) {
          let c = fs(i);
          _e(e.ph, Et, c), n = r(c, i), n[fe][Ie] = "", await Ml(n), await e.gc[Wt](c, i), Rt(e, c);
        }
        a = wl.get(n.el), a && a(!0);
      } else !s && n && (a ? a(!1, f) : f());
    });
  });
}, Ba = [Ie, Ua], Ct = Te(), Fa = (e, t, l) => {
  e.ph = gi(t), _e(fa(e), Kt, e.ph);
  let i, r = () => {
    aa(e), Ct.set(e.ph, e);
  };
  It(e, l, (n) => {
    let a = n();
    ut(() => {
      let f = ht(e);
      if (i = wl.get(e.el), a) {
        if (Ct.has(e.ph)) {
          for (let E of f)
            if (Ct.has(E) && E !== e.ph) {
              let s = Ct.get(E), c = ht(s);
              f = Mt(f, (p) => !M(c, p) || p === s.ph);
            }
          Ct[v](e.ph), _e(e.ph, Et, ...f);
        }
        i && i(!0);
      } else i ? i(!1, r) : r();
    });
  });
}, va = [tl, Fa], Jt = (e, t, l) => {
  let i = $l(t), [r] = se(i, "-"), n = e[Me][t] || {}, a = e.el, f = e.exec(e, l, "$entry", !1), E = hl(f, n[fl] || 100), s = new IntersectionObserver((c) => {
    I(c, (p) => {
      p.isIntersecting != (r == Lr) && (E(p), n[Ys] && s[Gl]());
    });
  }, n);
  s[vr](a), d(e, () => s[Gl]());
}, Ha = [
  [Bi, Jt],
  [k + Bi, Jt],
  [Fi, Jt],
  [k + Fi, Jt]
], Tr = (e, t, l) => {
  let i = $l(t);
  se(i, "-");
  let r = e.el, n = e[Me][t] || {}, a = n[oi] ? le(Ti) : r, f = e.exec(e, l, "$size", !1), E = hl(f, n[fl] || 100), s = new ResizeObserver((c) => {
    let p = c[0].borderBoxSize[0];
    E([p.inlineSize, p.blockSize]);
  });
  s[vr](a, n), d(e, () => s[Gl]());
}, Ya = [
  [vi, Tr],
  [k + vi, Tr]
], be = "keyup", et = "keydown", ur = "outside", ka = "window", Cs = "control", ri = "meta", Zt = "arrow", pr = [
  ri,
  Cs,
  "shift",
  "alt",
  "fn"
], za = {
  ctrl: Cs,
  cmd: ri,
  [Ks]: ri,
  esc: "escape",
  del: v,
  up: Zt + "up",
  down: Zt + "down",
  left: Zt + "left",
  right: Zt + "right"
}, Ka = (e, t, l) => {
  let i = $l(t), [r, ...n] = se(i, "-"), a = e.el, f = a, E = (h) => {
    let S = e.exec(e, l, yt + Mi, !1);
    Be(S) ? S(h) : x(ls(Mi, t, "a " + xl, Ge(S())));
  }, s = e[Me][t] || {};
  I(n, (h) => {
    s[h] = !0;
  }), fl in s && (E = hl(E, s[fl])), ki in s && (E = Ff(E, s[ki])), s[ur] || s[oi] ? f = St : s[ka] && (f = ge);
  let c = {};
  M([et, be], r) && I(we(s, "keys", []), (h) => {
    c[za[h] || h] = !0;
  });
  let p = Ut(c), T = r;
  if (M([et, be], r) && p) {
    let h = {};
    r = t;
    let S = hl((A) => {
      Ye(f, r, A);
    }, 600);
    d(e, re(f, et, (A) => {
      let O = Se(A.key);
      h[O] || (h[O] = !0), Xt(() => {
        h.meta && !M(pr, O) && Hl(A, h);
      });
      let m = ye(h);
      p > 1 && be == T && h.meta && !M(pr, O) ? S(m) : et == T && Ye(f, r, m);
    })), d(e, re(f, be, (A) => {
      et == T && Hl(A, h), Ye(f, r, ye(h)), be == T && Hl(A, h);
    })), d(e, re(f, "focus", () => {
      Ci(h);
    }));
  }
  d(e, re(f, r, (h) => {
    if (s[Hr] && h[ff](), s.stop && h.stopPropagation(), !(s.self && h[ae] !== h.currentTarget) && !(s[ur] && (a.contains(h[ae]) || !zf(a)))) {
      if (M([et, be], T)) {
        let S = h[mr];
        if (!(Ut(c) == Ut(S) && wi(ye(c), (A) => M(S, A))))
          return;
      }
      E(h);
    }
  }, s));
}, Hl = (e, t) => Qe(t, Se(e.key)), Ga = [/^(b-on|on)-([\w-$]+)$/, Ka], Va = (e, t, l) => {
  let i = e.el, r = $l(t), n = l || Ls(r);
  r = Kf(r);
  let a = J(i, r), f = e[Me][t] || {};
  It(e, n, (E) => {
    if (!E)
      return qt(_f(t), Si(t + `="${l}"`), Pe, i);
    let s = E(a || ""), c = f.prop || cs(r) && r;
    s || c ? mi(i, r, !c && s === !0 ? "" : s, c) : di(i, r);
  });
}, Wa = [/^(b-bind|bind)-([\w-$]+)$/, Va], bt = Te(), ja = (e, t, l) => {
  let i = b("the", t, Ve), r = b(ml, "a reactive", C), n = V + "ed", a = t + `="${l}"`, f = e.el, E = ve(f), s = f.type;
  if (!M([H, lt, V], E))
    return x(i, wr, H, `, ${lt}, and ${V} ${Le}s.`, a, f);
  let [c, p] = us(e.exec(e, l));
  if (!c)
    return x(i, r, a, f);
  let T = c[p], y, h = () => Ke(E == V ? f[Me] : K()), S = e[Me][t] || {}, A = (o) => {
    let u = o[ne(J(o, C)) && m ? tt : C], R = bt.get(o) || S;
    if (U(u) && (R.trim && (u = Q(u)), !R.raw)) {
      let N = si(u);
      (Ce(N) || ne(N) || Cf(N)) && (u = N);
    }
    return u;
  }, O = (o) => E == H && M(o, s), m = O([Ze, Yi]), K = () => Di(H + `[type="${Ze}"][name="${f.name}"]`), G = () => O(Ze) && P(K()) > 1, Oe = () => {
    let o = [
      [H, Ze, [Z, de, ll, ct]],
      [H, Yi, [Z, de, ll]],
      [H, Z, [Z]],
      [H, "range", [Z]],
      [H, "", [Z, de]],
      [lt, "", [Z, de]],
      [V, "", [Z, de, ll, ct]]
    ];
    for (let [u, R, N] of o)
      if (E == u && (!R || s == R)) {
        ne(T) || pl(T) || M(N, Ge(T)) || qt(i, r, Tl, Ne(N, " or "), `for ${E == H ? s + " " : ""}${u} ${Le}s,`, Si(Ge(T)), a, f);
        break;
      }
  };
  ut(() => {
    Oe(), V == E ? I(h(), (o) => bt.set(o, S)) : O(Ze) && bt.set(f, S);
  });
  let w = () => {
    if (T = c[p], y = A(f), M([H, lt], E))
      if (s == Ze && $(T))
        f[tt] = M(T, y);
      else if (m)
        f[tt] = T === y;
      else {
        if (f[ol] || St.activeElement === f && T === y) return;
        T !== y && (f[C] = T);
      }
    else E == V && ($(T) ? I(h(), (o) => {
      o[n] = M(T, A(o));
    }) : f[C] = T);
  };
  ut(() => d(e, Ht(w)));
  let B = {}, F = () => {
    if (T = c[p], E == V && f.multiple || G()) {
      let o = [];
      I(h(), (u) => {
        E == V && bt.set(u, S), (u[n] || u[tt]) && D(o, A(u));
      }), c[p] = o;
    } else c[p] = m && !f[tt] ? !1 : A(f);
  };
  (O([W, "search", "url", "tel", il, "password"]) || E == lt) && (B[qs] = Hf, B[Qs] = Yf);
  let L = S.lazy || m || E == V ? "change" : H;
  B[L] = F;
  for (let [o, u] of Je(B))
    d(e, re(f, o, u));
}, Xa = ["b-model", ja], q = "output", He = "cursor", at = He + "Updated", qa = "updateCursor", Qa = (e, t, l) => {
  let i = e.el;
  if (!(C in i && Bl in i))
    return x("the", t, Ve, wr, lt, Le + "s and textual", H, "types (text, email, etc.).");
  let r = {
    exp: e.exec(e, l, "$mask"),
    [C]: "",
    [He]: i[Bl],
    [qa]: zt,
    [at]: !1,
    [q]: "",
    char: Ul,
    letter: ln,
    number: Ds,
    alpha: rn,
    money: en
  }, n = () => {
    r[C] = i[C], r[C] != r[q] && (r[He] = i[Bl], Ja(r), i[C] = r[q], i.setSelectionRange(r[He], r[He]), Ye(i, Cl, r));
  };
  ut(n), d(e, re(i, H, n, !0));
}, Ja = (e) => {
  e[at] = !1, e[q] = "";
  let t = e.exp(e);
  if (Be(t)) {
    t(e);
    return;
  }
  let l = e[C], i = 0, r = P(l);
  I([...t], (n, a) => {
    U(n) && P(n) > 1 && t.splice(a, 1, ...se(n, ""));
  });
  for (let [n, a] of Je(t)) {
    if (i >= r) break;
    if ($(a)) {
      let f = 0, [E, s, c] = a;
      for (; i < r && f < c; ) {
        if (E(l[i]))
          f++, e[q] += l[i];
        else {
          let p = !1, T, y = n;
          for (; y > -1 && (T = Za(t, y + 1)); ) {
            if (ba(T, l, i)) {
              p = !0;
              break;
            }
            y = Sf(t, T, y);
          }
          if (p && f >= s) break;
        }
        i++, zt(e, i);
      }
    } else U(a) && (e[q] += a, l[i] == a && i++, zt(e, i));
  }
}, Za = (e, t) => {
  for (let l = t; l < P(e); l++) {
    let i = e[l];
    if ($(i))
      return i;
  }
}, ba = (e, t, l) => {
  let i = !1;
  if ($(e)) {
    let [r, n, a] = e;
    if (Be(r) && Ce(n) && Ce(a)) {
      let f = 0, E = P(t);
      for (let s = l; s < E && f < a; s++)
        r(t[s]) && f++;
      i = f > 0 && f >= n;
    }
  }
  return i;
}, en = (e = {}) => (t) => {
  let l = t[C], i = P(l), r = we(e, "thousands", ","), n = we(e, "decimal", "."), a = we(e, "precision", 2);
  n == "," && (r = "."), r == "." && (n = ",");
  let f = !1, E = !1, s = [], c = [], [p] = Ds();
  for (let y = 0; y < i; y++)
    l[y] == "-" ? !P(s) && !P(c) && (f = !0) : E ? P(c) < a && p(l[y]) && D(c, y) : l[y] == n ? E = !0 : p(l[y]) && (P(s) == 1 && l[s[0]] == "0" ? s[0] = y : D(s, y));
  t[q] = f ? "-" : "";
  let T = P(s);
  t[at] = !1;
  for (let y = 0; y < T; y++)
    y > 0 && (T - y) % 3 == 0 && (t[q] += r), t[q] += l[s[y]], zt(t, s[y] + 1);
  t[q] += E ? n : "";
  for (let y = 0; y < P(c); y++)
    t[q] += l[c[y]], zt(t, c[y] + 1);
  return t;
}, zt = (e, t) => {
  if (!e[at]) {
    let l = e[He];
    l == 0 ? e[at] = !0 : l <= t && (e[at] = !0, e[He] = P(e[q]));
  }
}, tn = (e = 1, t = 1) => (e = Ce(e) && e >= 0 ? e : 1, t = Ce(t) && t > e ? t : e > 0 ? e : 1, [e, t]), Ul = (e, t, l) => [U(e) ? (r) => r == e : (r) => Ee(r, e), ...tn(t, l)], ln = (e, t) => Ul(new RegExp("\\p{L}", "u"), e, t), Ds = (e, t) => Ul(new RegExp("\\p{Nd}", "u"), e, t), rn = (e, t) => Ul(/[\p{L}\p{Nd}]/u, e, t), sn = [k + Cl, Qa], fn = async (e, t, l) => {
  It(e, l, (i) => {
    let r = i();
    Be(r) && r();
  });
}, an = ["b-effect", fn], nn = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  pa,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  Ba,
  /**
   * Context directives
   * Notes:
   * - the order of inference is: $for, $data, $props, $store
   * - b-slot and b-ref are hydrated after b-data
   */
  ya,
  Na,
  /** List rendering
   * Notes:
   * - b-for stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  ha,
  /**
   * Unique ID generator
   */
  _a,
  /**
   * Run one or more scripts on the element, right after the context ($props, $data, $slot, $ref, $for, $id) is set up.
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  Ca,
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
  wa,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  va,
  // ['b-boost', hydrateBoost],
  $a,
  // b-transition, b-transition-play, b-transition-reverse
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  xa,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Oa,
  Sa,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  da,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
   * - The `b-mask` directive is used to format an input value using a mask
   */
  Wa,
  // [b-bind|bind]-[attributeName]
  Xa,
  sn,
  /**
   * Event directives
   */
  ...Ha,
  // [b-on|on]-enter, [b-on|on]-exit
  ...Ya,
  // [b-on|on]-resize
  Ga,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  an
], on = (e) => {
  I(nn, (t) => D(e[qr], t));
};
export {
  Wa as bindDirective,
  Na as dataDirective,
  ha as forDirective,
  Oa as htmlDirective,
  _a as idDirective,
  Ba as ifDirective,
  pa as ignoreDirective,
  Ha as intersectionDirectives,
  sn as maskDirective,
  Xa as modelDirective,
  En as newApp,
  Ga as onDirective,
  ya as propsDirective,
  Ya as resizeDirectives,
  Ca as scriptDirective,
  on as setAllDirectives,
  cn as setup,
  va as showDirective,
  da as styleDirective,
  xa as teleportDirective,
  wa as templateDirective,
  $a as transitionDirective
};
//# sourceMappingURL=briojs.2.0.0.js.map
