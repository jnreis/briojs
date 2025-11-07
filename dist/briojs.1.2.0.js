let se = (e) => e.trim(), we = (e) => e.toLowerCase(), fe = (e, t, l) => e.split(t, l), hr = (e, t) => e.match(t), Sr = (e) => e.toUpperCase(), Us = (e) => Sr(e[0]) + j(e, 1), Fs = (e) => we(e[0]) + j(e, 1), ze = (e, t, l) => e[yf](t, l), Mi = (e, t, l) => e[sf](t, l), _e = (e, t) => t.test(e), Ce = (e, t, l) => e[hi](t, l), Ul = (e, t, l) => {
  for (; _e(e, t); )
    e = Ce(e, t, l);
  return e;
}, Bs = (e) => _e(e, /^\d+$/), ks = (e) => _e(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !ze(e, k + " "), Or = (e) => _e(se(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), Hs = (e) => Fs(oe(Fe(fe(e, "-"), Us), "")), Ar = (e) => JSON.stringify(e), ii = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, ri = (e) => "`" + e + "`", te = (...e) => oe(e, " "), Jt = "brio", Tt = "$", nt = "$for", Fl = "$ref", Bl = "$slot", si = "$store", _r = "$tools", xt = "after", rl = "append", at = "array", ne = "attr", fi = "Attribute", Nr = "a valid", W = "b-", Ir = "b-for", me = "b-if", wr = "b-ignore", ni = "b-ref", mr = "b-save", Zt = "b-show", Pr = "b-slot", Il = "before", Ys = "body", bt = "boolean", Cr = "can only be used on", dr = "Cannot ", be = "checkbox", lt = "checked", Dr = "class", xr = "clone", ai = "composi", ci = "content", $r = "Content", Yt = "create", ut = "data", sl = "debounce", gr = "detail", Lr = "define", k = "delete", Ve = "directive", kl = "disconnect", fl = "display", Ei = "document", Ue = "element", el = "email", Mr = "end", vi = "entries", Ui = "error", Fi = "event", vr = "EventListener", Ur = "exit", qe = "get", Fr = "head", Bi = "href", oi = "html", Ti = "HTML", ui = "hydrate", pi = "index", Ks = "inner", zs = "insert", nl = "Invalid", Hl = "length", pt = "mask", Br = "message", Gs = "method", ye = "must be", de = `
`, st = "newValue", kr = "name", al = "Node", Ie = "nodes", Hr = "not found.", Rt = null, ee = "number", Kt = "object", Yr = "observe", _t = "oldValue", Ri = "on-", ki = Ri + "enter", Hi = Ri + Ur, Yi = Ri + "resize", Ws = "once", yi = "operation", Q = "options", Vs = "outer", wl = "parent", Ki = "patch", qs = "post", Yl = "prepend", Kr = "prevent", zr = "Propert", je = zr + "y", Se = "props", Gr = "put", zi = "radio", Xe = "remove", hi = "replace", ml = "requires", cl = "route", le = "script", X = "skip", z = "select", ie = "state", Wr = "start", Si = "storage", ge = "string", V = "style", Vr = "super", qr = "teleport", he = "template", J = "text", Gi = "throttle", Oi = "tion", js = "toString", El = "tokens", rt = "transition", jr = "type", Ee, Xr = "update", Qr = "valid", w = "value", Ai = "With", Xs = "add" + vr, $t = Tt + ut, zt = "$de" + ui, Gt = Tt + ui, Pl = Tt + zs, gt = Tt + Se, ke = W + ut, Jr = W + oi, _i = W + le, Ni = W + he, Qs = W + J, Js = Dr + "List", Zs = xr + al, ol = ai + "ng", bs = ai + Oi + Wr, ef = ai + Oi + Mr, tf = Yt + "Comment", lf = Yt + "Element", Kl = Lr + je, rf = Lr + zr + "ies", Wi = k + je, Zr = Ve + "s", sf = "ends" + Ai, Cl = "func" + Oi, ff = qe + fi, nf = qe + je + "Value", af = qe + je + "Priority", Vi = Fr + "ers", mt = Ks + Ti, K = "in" + Gr, Tl = pt + "s", br = pt + "Token", ul = br + "s", pl = "of " + jr, es = Vs + Ti, ts = "Own" + je, cf = wl + al, Rl = "path" + kr, Ef = Kr + "Default", ls = "proto" + jr, of = Xe + fi, Tf = Xe + vr, uf = Xe + je, Pt = hi + Ai, Nt = hi + "Children", qi = cl + "Rule", gl = z + "ionStart", is = z + "or", pf = "set" + fi, Rf = "set" + je, yf = Wr + "s" + Ai, hf = Si + "Area", Ae = "tar" + qe, it = J + "area", Ge = J + $r, Sf = Qr + "ate", Of = Qr + "ator", Af = "async" + Cl, rs = qe + ts + "Descriptor", _f = rs + "s", Nf = "has" + ts, ss = is + "Text", fs = (e, t, l, i) => `the ${e} ${t} ${ml} ${l}, ` + Ii(i), Ii = (e) => `but got ${e} instead.`, If = (e) => te(e, ml, "a reactive", w), $ = (e, ...t) => e.push(...t), wf = (e, t) => e.sort(t), oe = (e, t) => e.join(t), P = (e, t) => e.forEach(t), Fe = (e, t, l) => e.map(t, l), tl = (e, t, l) => e.filter(t, l), wi = (e, t, l) => e.find(t, l), mi = (e, t, l) => e.every(t, l), ns = (e, t, l) => e.some(t, l), mf = (e, t, l) => e.indexOf(t, l), Pf = (e, t) => t[1] - e[1], We = (e) => Array.from(e), ji = (e, t = 0) => Fe(We({ [Hl]: e }), (l, i) => t + i), ct = (e) => we(j(Ne[ls][js].call(e), 8, -1)), Qe = (e, t) => ct(e) === t, ae = (e) => e === Rt, yl = (e) => e === Ee, Te = (e) => Qe(e, Kt), U = (e) => Qe(e, at), Lt = (e) => Cf(e) || df(e), Cf = (e) => Qe(e, Cl), df = (e) => Qe(e, Af), B = (e) => Qe(e, ge), Mt = (e) => Qe(e, ee) && isFinite(e), Df = (e) => Qe(e, bt), xf = (e) => yt(e, as), yt = (e, t) => e instanceof t, ft = (e) => yt(e, Node), $f = (e) => yt(e, Text), De = (e) => yt(e, HTMLElement), zl = (e) => yt(e, Map), Gl = (e) => yt(e, Set), Le = window, Ne = Object, Ot = Reflect, hl = location, ht = Le[Ei], gf = Symbol, as = RegExp, q = (e, t) => Ne[ls][Nf].call(e, t), Pe = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, Je = (e, t) => delete e[t], Lf = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], G = (e, t, l = Ee, i = "") => {
  if (B(i)) {
    let r = i;
    i = { [w]: l }, P(Lf, ([a, f]) => {
      i[f] = !L(r, a);
    });
  }
  Ne[Kl](e, t, i);
}, Ct = (e) => d(ce(e)), ce = (e) => Ne.keys(e), Mf = (e = Rt) => Ne[Yt](e), vf = (e, t = {}) => {
  const l = Mf(e);
  return Ne[rf](
    l,
    Ne[_f](t)
  ), l;
}, Uf = (e, t, l = Ne) => l[rs](e, t), Ff = (e) => Ne.getPrototypeOf(e), Pi = (e, t = {}) => {
  P(ce(e), (l) => {
    G(e, l, e[l], t);
  });
}, Ci = (e) => P(ce(e), (t) => {
  Je(e, t);
}), xe = (e = Ee) => new Map(e), St = (e = Ee) => new Set(e), cs = (e, t) => new as(e, t), dt = (e, t) => {
  if (e === t) return e;
  if (U(e) && U(t)) {
    for (; d(e) > d(t); ) e.pop();
    for (let l = 0; l < d(t); l++)
      l < d(e) ? e[l] = dt(e[l], t[l]) : e.push(Me(t[l]));
  } else if (zl(e) && zl(t)) {
    let l = xe(e);
    e.clear();
    for (let [i, r] of Ze(t))
      e.set(i, l.has(i) ? dt(l.get(i), r) : Me(r));
  } else if (Gl(e) && Gl(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (Te(e) && Te(t)) {
    let l = { ...e };
    Ci(e);
    for (let i in t)
      q(t, i) && (e[i] = q(l, i) ? dt(l[i], t[i]) : Me(t[i]));
  } else
    return t;
  return e;
}, Me = (e) => {
  let t = e;
  if (Te(e)) {
    let l = {};
    for (let i in e)
      q(e, i) && (l[i] = Me(e[i]));
    t = l;
  }
  return U(e) && (t = Fe(e, Me)), zl(e) && (t = xe(Fe(We(Ze(e)), ([l, i]) => [l, Me(i)]))), Gl(e) && (t = St(Fe(We(e), Me))), t;
}, L = (e, t, l) => e.includes(t, l), Ze = (e) => Te(e) ? Ne[vi](e) : e[vi](), j = (e, t, l) => e.slice(t, l), d = (e) => yl(e[Hl]) ? e.size : e[Hl], dl = (e, t = 0) => setTimeout(e, t), Bf = (e) => {
  clearTimeout(e);
}, Sl = (e, t) => {
  let l;
  return (...i) => {
    Bf(l), l = dl(() => e(...i), t);
  };
}, kf = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, Xi = {}, Qi = (e) => j(Ce(crypto.randomUUID(), /-/g, ""), 0, e - 1), vt = (e = 8) => {
  let t = Qi(e);
  for (; t in Xi; ) t = Qi(d(t) + 1);
  return Xi[t] = !0, "b" + t;
}, Es = (e, ...t) => console[e]("Brio.js", ...t), Wt = (...e) => Es("warn", "warn:", de, ...e), D = (...e) => Es(Ui, `detected an ${Ui}:`, de, ...e), di = (e, t = ht) => We(t.querySelectorAll(e)), re = (e, t = ht) => B(e) ? di(e, t)[0] : e, He = (e, t, ...l) => e[t](...l), os = (e) => e[Zs](!0), Ts = (e, t) => P(We(e.attributes), ({ name: l, [w]: i }) => t(l, i)), Ut = (e) => e[Xe](), Ol = (e) => e[cf], us = (e) => se(e[Ge] || ""), ll = (e) => [...e.childNodes], Z = (e, t) => e[ff](t), Di = (e, t, l, i) => {
  i && (e[i] = l), e[pf](t, l);
}, xi = (e, t) => e[of](t), Hf = (e, ...t) => e[Js].add(...t), Ji = requestAnimationFrame, Be = (e) => Ji(() => Ji(e)), Wl = (e, t) => ht[lf](e, t), ps = (e) => ht[tf](e), Ye = (e) => we(e.tagName || ""), Oe = (e, t, l, i) => (e = re(e), e[Xs](t, l, i), () => e[Tf](t, l)), Ke = (e, t, l) => re(e).dispatchEvent(new CustomEvent(we(Ce(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [gr]: l
})), Al = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of ll(l && Ye(e) == he ? e[ci] : e))
      await Al(i, t, l);
}, Yf = (e) => e[Ae][ol] = !0, Kf = (e) => {
  let t = e[Ae];
  t[ol] && (t[ol] = !1, Ke(t, K));
}, Rs = (e) => Le.getComputedStyle(e), zf = (e) => {
  let t = Rs(e);
  return !(!Ol(e) || t[fl] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, Ft = (e = "", t = Bi) => new URL(e, hl[Bi])[t], ys = (e) => ze(Ft(e), hl.origin), hs = (e) => L(["src", w, lt, z + "ed"], e), Gf = (e) => Ce(Ce(e, /[^\w-]/g, ""), /^[^a-z_]+/i, ""), Ss = (e) => {
  let t = {};
  for (let l of e)
    t[l] = [e[nf](l), e[af](l)];
  return t;
}, Zi = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (ze(i, rt) ? t : l)[i] = e[i];
  return [t, l];
}, bi = (e) => {
  for (let t of document.styleSheets)
    try {
      for (let l of t.cssRules)
        if (l[ss] == e)
          return Ss(l[V]);
    } catch {
    }
}, Wf = (e, t, l, i) => {
  e[V][Rf](t, l, i);
}, Vf = (e, t) => {
  e[V][uf](t);
}, b = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Wf(e, i, ...l[i]);
}, Re = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Vf(e, i);
}, er = (e) => `only supports ${oe(j(e, 0, -1), ", ")}, and ${e[d(e) - 1]} insertions`, qf = (e) => async (t, l, i, r) => {
  let a = Pl + ":", f = l == J ? Ge : l, n = [Il, xt, Yl, rl, Pt, Nt, J], c = () => ns(n, (A) => A == l);
  if (!c())
    return D(a, er(n));
  let s = re(t);
  if (!ft(s))
    return D(a, Ae, ye, pl, al);
  if (re(oi) == s)
    return D(a, Ae, "cannot be the", Ti, Ue);
  if (n = [Nt, Yl, rl], (re(Fr) == s || re(Ys) == s) && !c())
    return D(a, Sr(Ye(s)), Ue, er(n));
  i = await i;
  let E = e[he];
  i in E && (i = E[i]);
  let T = f == Ge, p = i, N = !1;
  if (!T && B(i) && (p = Wl("div"), p[mt] = i, N = !0), !T && !ft(p))
    return D(a, ci, ye, pl, al, "or", ge);
  let u = Pe(r, is);
  if (!T && u && B(u) && (p = re(u, p), !ft(p)))
    return D(a, Ue, Hr);
  let h = e.gc[zt];
  if (f == Pt) await h(s, !1);
  else if (T || f == Nt)
    for (let A of ll(s)) await h(A, !1);
  let O = N ? ll(p) : [p];
  if (He(s, T ? Nt : f, ...O), T && (O = ll(s)), P(O, (A) => {
    let m = [];
    Ye(A) == le ? $(m, A) : De(A) && $(m, ...di(le, A)), P(m, (H) => {
      if (mi([_i, wr, mr, Pr], (F) => ae(Z(H, F)))) {
        let F = Wl(le);
        Ts(H, (Y, I) => Di(F, Y, I, hs(Y) && Y)), F[mt] = H[mt], He(H, Pt, F);
      }
    });
  }), Pe(r, ui, !0)) {
    let A = e.bnode[0];
    for (let m of O) {
      if (De(m)) {
        let H = A(m, s);
        await $l(H);
      }
      await e.gc[Gt](m, s);
    }
  }
  return O;
}, Ll = (e, t = "", l = "") => {
  let i = t == ut ? FormData : URLSearchParams, r = new i(), a = (f, n = "") => {
    Te(f) || U(f) ? P(Ze(f), ([c, s]) => {
      let E = n ? `${n}[${c}]` : c;
      a(s, E);
    }) : r[rl](n, f);
  };
  return a(e, l), r;
}, At = (e) => async (t, l, i = {}) => {
  let r = "status", a = $r + "-Type", f = Pe(i, "parser");
  if (Te(l)) {
    let n = i[Vi] || {}, c = wi(ce(n), (E) => we(E) == we(a)), s = we(n[c] || "");
    Je(n, c), e == qe || e == k ? (t += Ll(l), l = Ee) : Mi(s, "json") ? (l = Ar(l), n[a] = "application/json") : Mi(s, "form-data") ? l = Ll(l, ut) : l = Ll(l), i[Vi] = n;
  }
  try {
    let n = await fetch(t, { ...i, [Gs]: e, body: l }), c = await n[f || J]();
    if (!f)
      try {
        c = ii(c);
      } catch {
      }
    if (!n.ok) {
      let s = new Error(`HTTP ${n[r]}! Status text: ` + n.statusText);
      throw s.response = n, s[ci] = c, s;
    }
    return c;
  } catch (n) {
    throw n;
  }
}, Vl = {
  get: At(qe),
  post: At(qs),
  put: At(Gr),
  [Ki]: At(Ki),
  [k]: At(k)
}, jf = (e, t) => [
  // Set a route
  (l, i) => {
    if (Lt(i)) {
      l = Ft(l, Rl);
      let r = tl(fe(l, "/"), se), a = d(r) - 1, f = e;
      P(r, (n, c) => {
        n in f || (f[n] = {}), f = f[n], c == a && (f[wt] = i);
      });
    } else D(dr, "set route without a", cl, Cl, de, l);
  },
  /**
   * Get a route function by path.
   * 
   * @returns The route function, or `undefined` if not found, or `null` if not the same origin
   */
  (l) => {
    if (!ys(l))
      return Rt;
    l = Ft(l, Rl);
    let i = tl(fe(l, "/"), se), r = e, a = {}, f = 0;
    for (let n of i) {
      if (f = 0, n in r && !ze(n, ":"))
        r = r[n], f = 1;
      else for (let c of ce(r))
        if (ze(c, ":")) {
          let [s, E] = tl(fe(c, ":"), se);
          if (!E || E && E in t && t[E](n)) {
            let T = a[s];
            T ? U(T) ? $(T, n) : a[s] = [T, n] : a[s] = n, r = r[c], f = 1;
            break;
          }
        }
      if (!f) break;
    }
    if (f = f && r[wt] ? 1 : 0, f)
      return () => r[wt]({
        params: a,
        path: l,
        [Xe]: () => Je(r, wt)
      });
  }
], Os = (e, t) => {
  e = Ft(e, Rl), t && ys(e) ? (t(), e != hl[Rl] && history.pushState(Rt, "", e)) : hl.href = e;
}, Xf = (e) => $i(({ [ie]: t, prop: l }) => (kt(t)[X].add(l), e)), ql = !1, jl = [], As = (e) => (jl = [], ql = !0, e({}), ql = !1, [...jl]), _s = (e) => {
  let t = As(e), l = d(t), [i, r] = t[l - 1] || [];
  return [i, r];
}, ue = (e, t) => {
  if (!tr(e) || Bt(e)) return e;
  let l = {
    get(f, n) {
      return ql && (q(f, n) || !(n in f)) && $(jl, [i, n]), Ot.get(f, n, i);
    },
    set(f, n, c) {
      n in f || G(f, n);
      let s = i[n];
      if (s === c) return !0;
      let E = kt(i), T = {
        [Ae]: f,
        [ie]: i,
        prop: n,
        [_t]: s
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      Pi(T, "wc"), It.has(c) && (It[k](c), c = c(T)), r.has(n) || (c = ue(c)), T[st] = c, Qf(T);
      let p = Ot.set(f, n, c, i);
      return lr(E, T), p;
    },
    [Wi](f, n) {
      let c = f[n], s = Ot[Wi](f, n);
      return lr(kt(i), {
        [Ae]: f,
        [ie]: i,
        prop: n,
        [_t]: c,
        [st]: Ee,
        [yi]: k
      }), s;
    },
    [Kl](f, n, c) {
      let s = c[w], E = i[n];
      return It.has(s) && (c[w] = s({ [ie]: i, prop: n, [st]: s, [_t]: E })), !r.has(n) && w in c && (c[w] = ue(c[w])), Ot[Kl](f, n, c);
    }
  };
  const i = new Proxy(Bt(t) && Te(t) ? vf(t, e) : e, l), r = St();
  let a = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [ie]: xe(),
    [Se]: {},
    skip: r
    // refs: [],
    // [ON_SET]: {},
  };
  Dl.set(i, a);
  for (let f in e) {
    let n = e[f];
    It.has(n) && (n = n({
      [Ae]: e,
      [ie]: i,
      prop: f,
      [_t]: Ee
    })), !r.has(f) && tr(n) && Ot.set(e, f, n, i);
  }
  return i;
}, tr = (e) => U(e) || Te(e), lr = (e, t) => {
  let l = xe(), i = e[Se][t.prop];
  i && P(i, (a, f) => l.set(f, a)), P(e[ie], (a, f) => l.set(f, a));
  let r = We(l);
  wf(r, Pf);
  for (let [a] of r) a(t);
}, Qf = (e) => {
  e[yi] = yl(e[_t]) ? Yt : yl(e[st]) ? k : Xr;
}, Ns = "getItem", Is = "setItem", Xl = xe(), Jf = (e) => {
  let t = Ff(e);
  return t && q(t, Ns) && q(t, Is);
}, Ql = (e, t) => ii(e[Ns](t) || ""), ir = (e, t, l) => e[Is](t, Ar(l)), rr = (e) => "_b_" + e, ws = (e, t, l) => Jf(e) ? (l && (l = rr(l), q(e, l) && (t = Ql(e, l))), $i(({ [ie]: r, prop: a }) => (Xl.set(l, [r, a, e]), l = l || rr(a), q(e, l) ? t = Ql(e, l) : ir(e, l, t), dl(() => Dt(r, a, () => {
  ir(e, l, r[a]);
})), t))) : D(nl, Si, Kt), Zf = (e) => {
  if (Xl.has(e.key)) {
    let [t, l, i] = Xl.get(e.key);
    i === e[hf] && (t[l] = Ql(i, e.key));
  }
}, Et = (e, t, l = 0) => {
  let i = [], r = As(t || e);
  return P(r, ([a, f]) => {
    $(i, ms(a, f, e, l));
  }), t && e({}), () => P(i, (a) => a());
}, Dt = (e, t, l, i = 0) => {
  let r;
  return Bt(e) ? B(t) || Mt(t) ? r = ms(e, t, l, i) : r = bf(e, l, i) : (D(dr + `watch non-${ie} ${Kt}/${at}.`), r = () => {
  }), r;
}, Dl = xe(), It = St(), $i = (e) => It.add(e) && e, Bt = (e) => Dl.has(e), kt = (e) => Dl.get(e), Jl = (e) => Dl[k](e), bf = (e, t, l = 0) => {
  if (Bt(e)) {
    let i = kt(e)[ie];
    return i.set(t, l), () => i[k](t);
  }
}, ms = (e, t, l, i = 0) => {
  let r = kt(e)[Se];
  return r[t] || (r[t] = xe()), r[t].set(l, i), () => r[t][k](l);
};
G(ue, "persist", (e, t) => ws(localStorage, e, t), "wc");
G(ue, "session", (e, t) => ws(sessionStorage, e, t), "wc");
G(ue, "init", $i, "wc");
G(ue, X, Xf, "wc");
let Ps = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), en = (e, t) => t ? ri(e) : Ht(e), Cs = (e, t = "", l = !0) => (ks(e) && !l && (e += `(${t})`), Or(e) || (e = en(e, l == J), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), Ml = "required", sr = "matches", fr = "\\p{L}", tn = "\\p{Nd}", ln = cs(Ul(Ul("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, fr + tn), /l/, fr), "u"), rn = (e) => {
  let t = {}, l = {};
  e || (e = {});
  let i = (s, E, T) => {
    let p = !1;
    return (B(s) || U(s)) && (p = T ? d(s) >= E : d(s) <= E), Mt(s) && (p = T ? s >= E : s <= E), p;
  }, r = {
    [Ml]: (s) => !!s || s === 0,
    min: (s, E) => i(s, E, !0),
    max: (s, E) => i(s, E, !1),
    [el]: (s) => B(s) && _e(s, ln),
    same: (s, E, T) => s === T[E],
    in: (s, E) => U(E) && L(E, s),
    [sr]: (s, E) => B(s) && _e(s, E),
    type: (s, E) => r.in(ct(s), U(E) ? E : [E])
  }, a = {
    [Ml]: (s) => te(s, "is", Ml + "."),
    min: (s, E) => te(s, ye, "at least", E + "."),
    max: (s, E) => te(s, ye, "at most", E + "."),
    [el]: (s) => te(s, ye, Nr, el + "."),
    same: (s, E) => te(s, "must match", E + "."),
    in: (s, E) => te(s, ye, "equal to", oe(E, " or ") + "."),
    [sr]: (s) => s + " has an invalid format.",
    type: (s, E) => te(s, ye, pl, (U(E) ? oe(E, " or ") : E) + ".")
  }, f = (s, E) => {
    t[s] = E;
  }, n = (s, E, T) => {
    r[s] = E, T && (a[s] = T);
  }, c = () => {
    Ci(l);
    for (let [s, E] of Ze(t)) {
      let T = e[s];
      for (let p of E) {
        let N = "", u = "", h = "";
        B(p) ? N = p : Te(p) && (N = p[kr], u = p[w], h = p[Br]);
        let O = r[N];
        if (!O) {
          Wt("Unknown rule: " + N);
          continue;
        }
        O(T, u, e) || (l[s] || (l[s] = []), h ? $(l[s], h) : $(l[s], a[N](s, u, e) || s + " is invalid."));
      }
    }
    return !Ct(l);
  };
  return {
    prop: f,
    rule: n,
    [Sf]: c,
    errors: l
  };
};
St([
  // ECMAScript reserved keywords
  "break",
  "case",
  "catch",
  Dr,
  "const",
  "continue",
  "debugger",
  "default",
  k,
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "return",
  Vr,
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "enum",
  "await",
  "implements",
  "package",
  "protected",
  "interface",
  "private",
  "public",
  "static",
  "null",
  "true",
  "false"
]);
let nr = /^[a-z_$][\w$]*$/i, sn = (e) => {
  let t = St(), l = 1, i = 0, r = "", a = /('|"|`|\${|}|[a-z_$][\w$]*)/g, f;
  for (; (f = a.exec(e)) !== null; ) {
    let n = f[pi], c = e[n - 1] || "";
    if (c == "\\") {
      console.warn("Escaped character, skipping:", f[0]);
      continue;
    }
    let s = f[0];
    r ? s == r && (r = "") : s == "'" || s == '"' ? r = s : s == "`" ? l += l <= i ? 1 : -1 : s == "${" || s == "}" ? i += s == "}" ? -1 : 1 : l > 0 && l == i && c != "." && t.add([s, n, n + d(s)]);
  }
  return t;
}, fn = (e, t) => {
  let l = sn(t), i = "", r = 0, a = e.ctx;
  for (let [f, n, c] of l)
    for (let s of [nt, $t, gt, si, _r])
      if (a[s] && f in a[s]) {
        i += j(t, r, n) + `${s}.${f}`, r = c;
        break;
      }
  return i + j(t, r);
}, wt = gf(Jt), ds = [];
St();
let ra = () => {
  let e = (o) => T.get(o), t = (o, R = () => !0) => {
    let y = o ? Ol(o) : Rt;
    for (; y; ) {
      let S = e(y);
      if (S && R(S)) return S;
      y = Ol(y);
    }
  }, l = (o, R) => {
    let y = e(o);
    if (!y) {
      let S = R && e(R) || t(R || o);
      y = {
        // Local context
        // @ts-ignore
        ctx: { ...M },
        // A reference to the element. Convenience for internal use.
        el: o,
        [wl]: S,
        // Unique ID context
        id: Pe(S, "id", {}),
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
        [X]: 0,
        ...g
      };
      for (let _ in m) {
        let x = m[_](y, S);
        x && G(y.ctx, _, x, "c");
      }
      T.set(o, y), y[Q] = nn(y, W + Q)();
    }
    return y;
  }, i = async (o, R) => {
    B(o) && (o = re(o)), B(R) && (R = re(R)), ft(R) || (R = Ee), ft(o) && (await n(o), await Al(o, async (y) => {
      let S = !1, _ = o == y ? R : Ee;
      return $f(y) && us(y) ? S = a(y, _) : De(y) && (Ye(y) == le && ae(Z(y, _i)) ? S = !1 : S = await f(y, _)), S;
    }));
  }, r = async (o, R = !0, y = !0) => {
    await Al(o, async (S) => {
      let _ = e(S);
      if (_) {
        if (_[Ie])
          for (let x of _[Ie])
            await r(x, R, y);
        _.ph && Ut(_.ph), P(_.cFns, (x) => x()), y && T[k](S), R && Ut(S);
      }
      return !0;
    });
  }, a = (o, R) => {
    let y = o[Ge], S = En(Ht(y || ""));
    if (S && _e(S, an)) {
      let _ = l(o, R), x = E(_, fn(_, S), "", J);
      C(_, Et(() => o[Ge] = x(_.ctx))), Zl(_, J, y);
    }
    return !1;
  }, f = async (o, R) => {
    let y = l(o, R);
    if ($e(y, 3)) return !0;
    for (let [S, _] of p) {
      let x = [];
      if (xf(S))
        Ts(o, (pe, qt) => {
          _e(pe, S) && $(x, [pe, qt]);
        });
      else {
        let pe = Z(o, S);
        ae(pe) || $(x, [S, pe]);
      }
      for (let [pe, qt] of x) {
        if ($e(y, 1) || $e(y, 3)) break;
        Zl(y, pe, qt), await _(y, pe, Ht(qt));
      }
      if ($e(y, 1) || $e(y, 3)) break;
    }
    return $e(y, 0) && (y[X] = 1), Ct(y[ne]) || T[k](o), !$e(y, 2) && !$e(y, 3);
  }, n = async (o) => {
    let R = await Ds(o, mr, []);
    P(R, ([y, S]) => {
      let _ = Ye(S), x = _ != le && _ != V ? he : _, pe = S[x == he ? es : mt];
      g[x][y] = se(pe);
    });
  }, c = (o) => (R, y) => {
    g[o][R] = y;
  }, s = (o, R, y = "", S = !0) => {
    let _;
    return R = Cs($s(o, R), y, S), R in A ? _ = A[R] : (_ = vt(), O[_] = Ps(xs(o, R), R), A[R] = _), _;
  }, E = (o, R, y = "", S = !0) => {
    let _;
    try {
      let x = R in O ? R : s(o, R, y, S);
      _ = O[x](o.ctx);
    } catch (x) {
      D(x[Br]), _ = () => wt;
    }
    return _;
  }, T = xe(), p = [], N = {}, u = {}, h = { [ee]: Bs }, O = {}, A = {}, m = {
    // The $data context
    [$t]: ar($t, ke),
    // Reactive properties defined in the element or inherited from the parent context
    [gt]: ar(gt, W + Se, !0),
    // The $for context
    [nt]: (o, R) => R == null ? void 0 : R.ctx[nt],
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [Fl]: cr(Fl),
    [Bl]: cr(Bl),
    // The element itself
    $el: (o) => o.el,
    // Unique identifier for the element
    $id: (o) => o.id,
    $cleanup: (o) => (R) => C(o, R)
  }, [H, F] = jf(u, h), Y = (o) => Os(o, F(o)), I = {
    [cl]: H,
    [qi]: c(qi + "s"),
    [he]: c(he),
    [V]: c(V),
    [le]: c(le),
    [Se]: c(Se),
    data: c(ut),
    mask: c(Tl),
    [br]: c(ul)
  }, M = {
    [si]: ue({}),
    $set: I,
    [Gt]: i,
    [zt]: r
  }, v = {
    http: Vl,
    state: ue,
    watch: Dt,
    effect: Et,
    [cl]: Y,
    emit: Ke,
    listen: Oe,
    /** Get the local context of an element */
    context: (o) => {
      var R;
      return (R = e(re(o))) == null ? void 0 : R.ctx;
    },
    // Tools
    hasProp: q,
    getProp: Pe,
    setProp: G,
    sync: dt,
    [xr]: Me,
    [Of]: rn,
    uid: vt
  };
  P(ce(v), (o) => M[Tt + o] = v[o]);
  let g = {
    [he]: N,
    [V]: {},
    [le]: {},
    [Se]: {},
    data: {},
    // ! HYDRATION
    [Zr]: p,
    bnodes: T,
    [Tl]: {},
    [ul]: {},
    routes: u,
    routeRules: h,
    // ! PUBLIC CONTEXT
    gc: M,
    // ! TOOLS
    exec: E,
    bnode: [l, e]
  };
  return M[Pl] = qf(g), $(ds, F), P([I, Vl, M, g], (o) => Pi(o, "wc")), g;
}, $e = (e, t) => e[X] == t, C = (e, t) => {
  $(e.cFns, t);
}, ot = (e, t) => {
  let l = e[wl];
  l && (l[Ie] || (l[Ie] = []), L(l[Ie], t) || $(l[Ie], t));
}, nn = (e, t, l = "{}") => {
  let i = De(e.el) ? Z(e.el, t) : null;
  return ae(i) || Zl(e, t, i), i = Ht(i || l), e.exec(e, i);
}, Zl = (e, t, l) => {
  e[ne][t] = l, De(e.el) && xi(e.el, t);
}, Ht = (e) => Ce(oe(Fe(fe(e, de), (t) => ze(se(t), "//") ? "" : t), de), /;$/, ""), an = /\${((?!.*\${).*?)}/, cn = /{{((?!.*{{).*?)}}/, En = (e, t = "${$1}") => Ul(e, cn, t), ar = (e, t, l) => (i, r) => {
  let a = i.el, f = r ? r.ctx[e] : Rt, n = De(a), c = n && !ae(Z(a, t)), s = n && (i[ne][me] || !ae(Z(a, me))), E = n && (!f || c);
  return E && !c && t == ke && Di(a, ke, ""), E && !s ? ue({}, l && f) : f || {};
}, cr = (e) => (t, l) => !l || De(t.el) && !ae(Z(t.el, ke)) ? {} : l.ctx[e], on = () => {
  let e = Ft();
  Os(e, wi(ds, (t) => t(e)));
}, sa = (e = {}) => {
  Jt in Le || (Pi(e, "wc"), G(Le, Jt, e, "wc"), Oe(Le, Si, Zf), Oe(Le, "pop" + ie, on)), Ke(Le, Jt);
}, xl = (e) => (e.match(/^(b-\w+|bind|on)(-([\w-$]+))?$/) || [])[3] || "", $l = async (e) => {
  await Er(e, Pr), await Er(e, ni);
}, Er = async (e, t) => {
  let l = t == ni, i = e.ctx[l ? Fl : Bl], r = l ? [
    /*B_IF,*/
    Ir,
    Ni,
    ke
  ] : [ke];
  for (let a of e[Ie] || [e.el]) {
    let f = await Ds(a, t, r);
    P(f, ([n, c]) => {
      i[n] = l ? c : c[es], C(e, () => Je(i, n));
    });
  }
}, Ds = async (e, t, l) => {
  let i = [], r = t != ni;
  return await Al(e, (a) => {
    if (De(a)) {
      if (ns(l, (n) => !ae(Z(a, n)))) return !1;
      let f = Z(a, t);
      f && (xi(a, t), $(i, [f, a]), r && Ut(a));
    }
    return !0;
  }, r), i;
}, xs = (e, t) => "{" + oe(tl(ce(e.ctx), (l) => L(t, l)), ",") + "}", $s = (e, t) => {
  for (let l of [nt, $t, gt, si, _r]) {
    let i = e.ctx[l];
    if (i && t in i) {
      t = l + "." + t;
      break;
    }
  }
  return t;
}, Vt = (e, t, l) => {
  let i = e.exec(e, t);
  C(e, Et(() => l(i)));
}, gs = (e, t, l) => {
  let i = [];
  return l && (l in t ? $(i, t[l]) : (l = e.exec(e, l)(), U(l) && P(l, (r) => {
    r in t && $(i, t[r]);
  }))), i;
}, Tn = async (e, t) => {
  e[X] = 3;
}, un = [wr, Tn], pn = (e, t, l) => {
  let i = e.el, [r, a] = e.bnode;
  e[X] = 3;
  let [f, n] = Fe(fe(l, " in "), se), [c, s] = Fe(fe(f, ","), se);
  s || (s = pi);
  let E = te("the", t, Ve, ml);
  if (!_e(c, nr) || !_e(s, nr))
    return D(E, Nr, "alias.");
  let T = e.exec(e, n), [p, N] = _s(T), u = p ? p[N] : T(), h = p && Bt(u), O = !1;
  if (Mt(u) && (u = ue(ji(u, 1)), O = !0, p && Et(() => {
    let I = p[N] || 0;
    Mt(I) && dt(u, ji(I, 1));
  }, () => p[N])), !(U(u) || Te(u)))
    return D(E, `an ${at}, ${Kt}, or ${ee}.`);
  e.ph = ps(t), He(i, Pt, e.ph), ot(e, i);
  let A = {}, m = async ([I, M]) => {
    let v = os(i);
    He(e.ph, Il, v);
    let g = r(v, i);
    g[ne][t] = "", q(e[ne], me) && (g[ne][me] = "");
    let o = ue({});
    G(o, c, M, "c"), G(o, s, I, "c"), G(g.ctx, nt, o, "c"), C(g, () => {
      Jl(o);
    }), C(g, Dt(o, s, ({ [st]: R }) => {
      let y = A[I][1];
      R !== y && (o[s] = y);
    })), h && C(g, Dt(o, c, () => {
      u[o[s]] = o[c];
    })), A[I] = [v, I], await $l(g), await e.gc[Gt](v, i);
  }, H = ([I, M]) => {
    let v = A[I], g = a(v && v[0]);
    if (g) {
      let o = g.ctx[nt];
      o[c] = M, o[s] = I, v[1] = I;
    }
  }, F = ([I, M]) => {
    let [v] = A[I];
    e.gc[zt](v), Je(A, I);
  }, Y = {
    [Yt]: m,
    [Xr]: H,
    [k]: F
  };
  for (let I of Ze(u))
    m(I);
  p && C(e, Dt(u, Ee, ({ [yi]: I, prop: M, [st]: v }) => {
    Y[I]([M, v]);
  })), C(e, () => {
    for (let I in A)
      F([Number(I), null]);
    O && Jl(u);
  });
}, Rn = [Ir, pn], Ls = async (e, t, l) => {
  let i = t == ke, r = i ? $t : gt, a = e[i ? ut : Se][l], f = e[wl] || e;
  !Lt(a) && l && (a = e.exec(f, l)());
  let n = Lt(a) ? await a(f.ctx) : {};
  if (!Te(n))
    return e[X] = 3, D(fs(Ve, t, "an " + Kt, ct(n)));
  for (let c in n) G(e.ctx[r], c, n[c], Uf(n, c));
  i && await $l(e), C(e, () => {
    dl(() => {
      Jl(e.ctx[r]);
    });
  });
}, yn = [W + Se, Ls], hn = [ke, Ls], or = {}, Sn = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!U(i) || !mi(i, B))
      return D("the", t, Ve, ye, `an ${at} of ${ge}(s).`);
    e.id = i.reduce((r, a) => {
      let f = vt(5);
      return or[f] = !0, G(r, a, f, "wc"), r;
    }, {}), C(e, () => {
      for (let r in e.id) Je(or, e.id[r]);
    });
  }
}, On = ["b-id", Sn], Ms = (e) => (t, l, i) => {
  if (!(q(t[ne], Ni) || q(t[ne], Jr) && e == J)) {
    t[X] = 2;
    let r = t[he];
    i in r && (i = ri(i)), i && Vt(t, i, async (a) => {
      await t.gc[Pl](t.el, e, a()), t[X] = 3;
    });
  }
}, An = [Jr, Ms(Nt)], _n = [Qs, Ms(J)], Nn = async (e, t, l) => {
  let i = e.el, r = l ? e[he][l] || e.exec(e, l)() : i[mt];
  e[X] = 2, B(r) ? (e[Ie] = await e.gc[Pl](i, Il, se(r)), ot(e, i), Ut(i)) : Wt(t + ":", nl, w, de, r);
}, In = [Ni, Nn], wn = async (e, t, l) => {
  let i = e.el;
  e[X] = 2;
  let r = gs(e, e[le], l);
  if (Ye(i) == le) {
    ot(e, i);
    let a = Z(i, "src"), f = a ? await Vl.get(a) : us(i);
    f && $(r, Ht(f)), Ut(i);
  }
  for (let a of r) {
    let f = a;
    if (B(f)) {
      let n = Or(f);
      f = Ps(xs(e, f), f, n), n && (f = f(e.ctx));
    }
    Lt(f) && await f(e.ctx);
  }
}, mn = [_i, wn], Pn = (e, t, l) => {
  let i = e.el;
  if (l && Ye(i) != V) {
    let r = gs(e, e[V], l), a = vt();
    Hf(i, a);
    let f = Wl(V);
    He(i, xt, f), f[Ge] = oe(r, de), f[Ge] = Cn(f, "." + a), e.gc[Gt](f, i), C(e, () => {
      e.gc[zt](f);
    });
  }
}, Cn = (e, t) => {
  var i;
  let l = [];
  console.log("CSS Rules:", e);
  for (let r of ((i = e.sheet) == null ? void 0 : i.cssRules) || []) {
    let a = r[ss];
    $(l, Ce(r.cssText, a, t + " " + a));
  }
  return oe(l, de);
}, dn = [W + V, Pn], Dn = (e, t, l) => {
  let i = e.el, r = l, a, f = e.ctx.$ref;
  r in f && (r = ri(r)), Vt(e, r, (n) => {
    r = n(), U(r) && ([r, a] = r), B(r) && r in f && (r = f[r]), L([Il, xt, Yl, rl], a) || (a = xt), ft(r) ? (He(r, a, ...e[Ie] || [i]), ot(e, i)) : Wt(qr, Ue, Hr, t + `="${l}"`);
  });
}, xn = [W + qr, Dn], gi = vt(), $n = (e, t, l) => {
  if (!(q(e[ne], me) ? me : q(e[ne], Zt) ? Zt : ""))
    return D("the", t, Ve, ye, "used with", me, "or", Zt + ".");
  let r = e.exec(e, l)();
  if (U(r) || d(r) == 2) {
    let a = Ln(e.el, ...r);
    e[Q][gi] = a, C(e, a[Xe]);
  }
}, gn = [W + rt, $n], Ln = (e, t, l) => {
  if (!De(e))
    return D(nl, rt, Ue, e);
  let i = null, r = 1, a = 2, f = 3, n = 4, c = r, s = {
    [rt]: ["none", "important"]
  }, E = Ss(e[V]), T, p, N, u, h, O, A = () => {
    if (T = bi(t), u = bi(l), !T || !u)
      return D(nl, rt, z + "ors:", `'${t}' and '${l}'`, ye, "valid CSS", z + "ors.");
    [p, N] = Zi(T), [h, O] = Zi(u);
  }, m, H = Oe(e, rt + Mr, (Y) => {
    Y[Ae] === e && (c == a ? (c = n, i && (Re(e, T), b(e, E))) : c == f && (c = r, i || (Re(e, u), b(e, E))), m && m());
  }), F = (Y, I) => {
    m = I, !(Y && i && c == n || !Y && i === !1 && c == n) && (A(), Y ? i === null || i && c == r || i === !1 && c == n ? (i = !0, c = a, Re(e, u, p), b(e, N, s), Be(() => {
      Re(e, N, s), b(e, p);
    })) : !i && c == a ? (c = f, Re(e, O), b(e, h)) : i && c == f && (c = a, Re(e, N), b(e, p)) : (i === null && (i = !1, c = n, Re(e, T, h), b(e, O, s), Be(() => {
      Re(e, s), m && m();
    })), !i && c == r || i && c == n ? (i = !1, c = a, Re(e, T), b(e, s), Be(() => {
      Re(e, s), b(e, u);
    })) : i && c == a ? (c = f, b(e, T)) : !i && c == f && (c = a, b(e, u))));
  };
  return G(F, Xe, H), F;
}, Mn = (e, t, l) => {
  let i = e.el;
  e.ph = ps(t), He(i, Pt, e.ph), e[X] = 3, ot(e, i);
  let [r] = e.bnode, a, f, n = () => {
    e.gc[zt](a.el), a = Ee;
  };
  Vt(e, l, (c) => {
    let s = c();
    Be(async () => {
      if (s) {
        if (!a) {
          let E = os(i);
          He(e.ph, xt, E), a = r(E, i), a[ne][me] = "", await $l(a), await e.gc[Gt](E, i), ot(e, E);
        }
        f = a[Q][gi], f && f(!0);
      } else !s && a && (f ? f(!1, n) : n());
    });
  });
}, vn = [me, Mn], Un = (e, t, l) => {
  let i = e.el, r = Rs(e.el)[fl];
  r == "none" && (r = "block"), Vt(e, l, (a) => {
    let f = a();
    Ol(i) && Be(() => {
      let n = e[Q][gi];
      f ? (i[V][fl] = r, n && n(!0)) : n ? n(!1, () => Tr(i)) : Tr(i);
    });
  });
}, Fn = [Zt, Un], Tr = (e) => {
  e[V][fl] = "none";
}, jt = (e, t, l) => {
  let i = xl(t), [r] = fe(i, "-"), a = e[Q][t] || {}, f = e.el, n = e.exec(e, l, "$entry", !1), c = Sl(n, a[sl] || 100), s = new IntersectionObserver((E) => {
    P(E, (T) => {
      T.isIntersecting != (r == Ur) && (c(T), a[Ws] && s[kl]());
    });
  }, a);
  s[Yr](f), C(e, () => s[kl]());
}, Bn = [
  [ki, jt],
  [W + ki, jt],
  [Hi, jt],
  [W + Hi, jt]
], ur = (e, t, l) => {
  let i = xl(t);
  fe(i, "-");
  let r = e.el, a = e[Q][t] || {}, f = a[Ei] ? re(oi) : r, n = e.exec(e, l, "$size", !1), c = Sl(n, a[sl] || 100), s = new ResizeObserver((E) => {
    let T = E[0].borderBoxSize[0];
    c([T.inlineSize, T.blockSize]);
  });
  s[Yr](f, a), C(e, () => s[kl]());
}, kn = [
  [Yi, ur],
  [W + Yi, ur]
], et = "keyup", tt = "keydown", pr = "outside", Hn = "window", vs = "control", bl = "meta", Xt = "arrow", Rr = [
  bl,
  vs,
  "shift",
  "alt",
  "fn"
], Yn = {
  ctrl: vs,
  cmd: bl,
  [Vr]: bl,
  esc: "escape",
  del: k,
  up: Xt + "up",
  down: Xt + "down",
  left: Xt + "left",
  right: Xt + "right"
}, Kn = (e, t, l) => {
  let i = xl(t), [r, ...a] = fe(i, "-"), f = e.el, n = f, c = (u) => {
    let h = e.exec(e, l, Tt + Fi, !1);
    Lt(h) ? h(u) : D(fs(Fi, t, "a " + Cl, ct(h())));
  }, s = e[Q][t] || {};
  P(a, (u) => {
    s[u] = !0;
  }), sl in s && (c = Sl(c, s[sl])), Gi in s && (c = kf(c, s[Gi])), s[pr] || s[Ei] ? n = ht : s[Hn] && (n = Le);
  let E = {};
  L([tt, et], r) && P(Pe(s, "keys", []), (u) => {
    E[Yn[u] || u] = !0;
  });
  let T = Ct(E), p = r;
  if (L([tt, et], r) && T) {
    let u = {};
    r = t;
    let h = Sl((O) => {
      Ke(n, r, O);
    }, 600);
    C(e, Oe(n, tt, (O) => {
      let A = we(O.key);
      u[A] || (u[A] = !0), dl(() => {
        u.meta && !L(Rr, A) && vl(O, u);
      });
      let m = ce(u);
      T > 1 && et == p && u.meta && !L(Rr, A) ? h(m) : tt == p && Ke(n, r, m);
    })), C(e, Oe(n, et, (O) => {
      tt == p && vl(O, u), Ke(n, r, ce(u)), et == p && vl(O, u);
    })), C(e, Oe(n, "focus", () => {
      Ci(u);
    }));
  }
  C(e, Oe(n, r, (u) => {
    if (s[Kr] && u[Ef](), s.stop && u.stopPropagation(), !(s.self && u[Ae] !== u.currentTarget) && !(s[pr] && (f.contains(u[Ae]) || !zf(f)))) {
      if (L([tt, et], p)) {
        let h = u[gr];
        if (!(Ct(E) == Ct(h) && mi(ce(E), (O) => L(h, O))))
          return;
      }
      c(u);
    }
  }, s));
}, vl = (e, t) => Je(t, we(e.key)), zn = [/^(b-on|on)-([\w-$]+)$/, Kn], Gn = (e, t, l) => {
  let i = e.el, r = xl(t), a = l || Hs(r);
  r = Gf(r);
  let f = Z(i, r), n = e[Q][t] || {};
  Vt(e, a, (c) => {
    if (!c)
      return Wt(If(t), Ii(t + `="${l}"`), de, i);
    let s = c(f || ""), E = n.prop || hs(r) && r;
    s || E ? Di(i, r, !E && s === !0 ? "" : s, E) : xi(i, r);
  });
}, Wn = [/^(b-bind|bind)-([\w-$]+)$/, Gn], Qt = xe(), Vn = (e, t, l) => {
  let i = te("the", t, Ve), r = te(ml, "a reactive", w), a = z + "ed", f = t + `="${l}"`, n = e.el, c = Ye(n), s = n.type;
  if (!L([K, it, z], c))
    return D(i, Cr, K, `, ${it}, and ${z} ${Ue}s.`, f, n);
  let [E, T] = _s(e.exec(e, l));
  if (!E)
    return D(i, r, f, n);
  let p = E[T], N, u = () => We(c == z ? n[Q] : H()), h = e[Q][t] || {}, O = (o) => {
    let R = o[ae(Z(o, w)) && m ? lt : w], y = Qt.get(o) || h;
    if (B(R) && (y.trim && (R = se(R)), !y.raw)) {
      let S = ii(R);
      (Mt(S) || ae(S) || Df(S)) && (R = S);
    }
    return R;
  }, A = (o) => c == K && L(o, s), m = A([be, zi]), H = () => di(K + `[type="${be}"][name="${n.name}"]`), F = () => A(be) && d(H()) > 1, Y = () => {
    let o = [
      [K, be, [ee, ge, bt, at]],
      [K, zi, [ee, ge, bt]],
      [K, ee, [ee]],
      [K, "range", [ee]],
      [K, "", [ee, ge]],
      [it, "", [ee, ge]],
      [z, "", [ee, ge, bt, at]]
    ];
    for (let [R, y, S] of o)
      if (c == R && (!y || s == y)) {
        ae(p) || yl(p) || L(S, ct(p)) || Wt(i, r, pl, oe(S, " or "), `for ${c == K ? s + " " : ""}${R} ${Ue}s,`, Ii(ct(p)), f, n);
        break;
      }
  };
  Be(() => {
    Y(), z == c ? P(u(), (o) => Qt.set(o, h)) : A(be) && Qt.set(n, h);
  });
  let I = () => {
    if (p = E[T], N = O(n), L([K, it], c))
      if (s == be && U(p))
        n[lt] = L(p, N);
      else if (m)
        n[lt] = p === N;
      else {
        if (n[ol] || ht.activeElement === n && p === N) return;
        p !== N && (n[w] = p);
      }
    else c == z && (U(p) ? P(u(), (o) => {
      o[a] = L(p, O(o));
    }) : n[w] = p);
  };
  Be(() => C(e, Et(I)));
  let M = {}, v = () => {
    if (p = E[T], c == z && n.multiple || F()) {
      let o = [];
      P(u(), (R) => {
        c == z && Qt.set(R, h), (R[a] || R[lt]) && $(o, O(R));
      }), E[T] = o;
    } else E[T] = m && !n[lt] ? !1 : O(n);
  };
  (A([J, "search", "url", "tel", el, "password"]) || c == it) && (M[bs] = Yf, M[ef] = Kf);
  let g = h.lazy || m || c == z ? "change" : K;
  M[g] = v;
  for (let [o, R] of Ze(M))
    C(e, Oe(n, o, R));
}, qn = ["b-model", Vn], jn = (e) => {
  e["#"] = new RegExp("\\p{Nd}", "u"), e["&"] = /[\p{L}]/u, e["*"] = /[\p{L}\p{Nd}]/u;
}, il = "output", ve = "cursor", Li = "character", ei = "quantifier", _l = "isToken", Nl = "isOptional", ti = "isMultiple", li = "parts", Xn = (e, t, l) => {
  let i = e.el, r = e[Tl];
  if (!(w in i && gl in i))
    return D("the", t, Ve, Cr, it, Ue + "s and textual", K, "types (text, email, etc.).");
  let a = r[l], f = e[Q][t] || {}, n = {
    ...f,
    [El]: { ...e[ul], ...f[El] },
    mask: l,
    [w]: "",
    [ve]: i[gl],
    [li]: [],
    [il]: ""
  }, c = () => {
    n[w] = i[w], n[w] != n[il] && (n[li] = [], n[ve] = i[gl], a && a(n), Zn(n), i[w] = n[il], i.setSelectionRange(n[ve], n[ve]), Ke(i, pt, n));
  };
  Be(c), C(e, Oe(i, K, c, !0));
}, Qn = (e, t) => {
  let l = [], i = "\\";
  for (let r = 0; r < d(e); r++) {
    let a = e[r], f = {
      [Li]: a,
      [ei]: 1,
      [_l]: !1,
      [Nl]: !1,
      [ti]: !1
    };
    if (a != i || a == i && e[r + 1] == i) {
      if (L(ce(t), a) && (e[r - 1] != i || e[r - 2] == i)) {
        let n = hr(j(e, r + 1), /^\d+/);
        if (n) {
          let s = n[0];
          r += d(s), f[ei] = +s;
        }
        f[_l] = !0;
        let c = e[r + 1];
        (c == "?" || c == "+") && (f[Nl] = c == "?", f[ti] = c == "+", r++);
      }
      $(l, f);
    }
  }
  return l;
}, Jn = (e, t) => wi(j(e, t + 1), (l) => !l[Nl]), yr = (e, t, l) => {
  let i = -1;
  if (t) {
    let r = t[Li];
    if (t[_l]) {
      let a = hr(e, l[r]);
      a && (i = a[pi]);
    } else i = mf(e, r);
  }
  return i;
}, Zn = (e) => {
  let t = e[El], l = e[w], i = e[ve], r = Qn(e[pt], t), a = "", f = l, n = j(l, i);
  for (let [c, s] of Ze(r)) {
    let E = s[Li], T = s[ei];
    if (s[_l]) {
      if (T > 0) {
        if (!f) break;
        let p = "";
        for (; f && (T > 0 || s[ti]); ) {
          let N = s[Nl] || T < 1, u = yr(f, s, t), h = N && u > 0 && Jn(r, +c), O = yr(f, h, t);
          if (u < 0 || O >= 0 && u > O) {
            N || (f = "");
            break;
          }
          u || (p += f[0], T--), f = j(f, 1), n == f && (i = d(a + p));
        }
        a += p, s[w] = p;
      }
    } else f && (n == f && (i = d(a)), a += E, s[w] = E, f[0] == E && (f = j(f, 1)));
  }
  e[ve] = e[ve] == 0 ? 0 : e[ve] == d(e[w]) ? d(a) : i, e[il] = a, e[li] = r;
}, bn = (e) => {
  let t = e[w], l = Pe(e, "decimal", "."), i = Pe(e, "thousands", ","), r = Pe(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let a = fe(t, l), f = a[0], n = ze(f, "-");
  f = Ce(f, /\D/g, ""), f = f && (Ce(f, /^0+/, "") || "0");
  let c = d(a) > 1, s = c ? oe(j(a, 1), l) : "", E = d(f), T = n ? "-" : "";
  for (let h = 0; h < E; h++)
    h > 0 && (E - h) % 3 == 0 && (T += i), T += "#";
  let p = e[El];
  t = n ? "-" + f : f, r > 0 && (p[l] = cs(`\\${l}`), c && (t += l + s), T += l + "#" + r), e[pt] = T, n && (p["-"] = /-/), p["#"] = /\d/;
  let N = 0, u = "";
  for (let h of e[w])
    h == t[N] ? (u += h, N++) : u += "∅";
  e[w] = u;
}, ea = [W + pt, Xn], ta = async (e, t, l) => {
  l = $s(e, l), l = Cs(l, "", !1);
  let i = e.exec(e, l);
  C(e, Et(() => i()));
}, la = ["b-effect", ta], ia = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  un,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  vn,
  /**
   * Context directives
   * Notes:
   * - the order of inference is: $for, $data, $props, $store, $tools
   * - b-slot and b-ref are hydrated after b-data
   */
  yn,
  hn,
  /** List rendering
   * Notes:
   * - b-for stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  Rn,
  /**
   * Unique ID generator
   */
  On,
  /**
   * Run one or more scripts on the element, right after the context ($props, $data, $slot, $ref, $for, $id) is set up.
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  mn,
  /**
   * Static template hydration
   * Notes:
   * - the inner HTML of the element is used as a template and it may include more than one root element
   * - the element that contains the b-template directive is removed from the DOM and its content is inserted in its place
   *   and because of that:
   *   - the b-template directive SHOULD NOT be used with elements that are self-closing (e.g. <img />, <input />, etc.)
   *   - the b-template directive CANNOT be used with: b-show, b-html, b-text, b-style, bind-*, b-model, b-mask, b-transition, on-*
   *     this is because these directives need to be hydrated on the element itself and not on its content
   *   - the b-template directive CAN be used with: b-ignore, b-props, b-data, b-ref, b-slot, b-if, b-for, b-id, b-teleport, b-script, b-effect
   */
  In,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  Fn,
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  xn,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  An,
  _n,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  dn,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
   * - The `b-mask` directive is used to format an input value using a mask
   */
  Wn,
  // [b-bind|bind]-[attributeName]
  qn,
  ea,
  // ['b-boost', hydrateBoost],
  gn,
  // b-transition, b-transition-play, b-transition-reverse
  /**
   * Event directives
   */
  ...Bn,
  // [b-on|on]-enter, [b-on|on]-exit
  ...kn,
  // [b-on|on]-resize
  zn,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  la
], fa = (e) => {
  P(ia, (t) => $(e[Zr], t)), e[Tl].money = bn, jn(e[ul]);
};
export {
  Wn as bindDirective,
  hn as dataDirective,
  Rn as forDirective,
  An as htmlDirective,
  On as idDirective,
  vn as ifDirective,
  un as ignoreDirective,
  Bn as intersectionDirectives,
  ea as maskDirective,
  qn as modelDirective,
  bn as moneyMask,
  ra as newApp,
  zn as onDirective,
  yn as propsDirective,
  kn as resizeDirectives,
  mn as scriptDirective,
  fa as setAllDirectives,
  jn as setDefaultMaskTokens,
  sa as setup,
  Fn as showDirective,
  dn as styleDirective,
  xn as teleportDirective,
  In as templateDirective,
  gn as transitionDirective
};
//# sourceMappingURL=briojs.1.2.0.js.map
