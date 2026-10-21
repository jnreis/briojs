(() => {
    const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const VAT = /^[A-Z]{2}[A-Z0-9]{8,12}$/;
    const NOTES_LIMIT = 280;
    const PROMOS = { BRIO20: 0.2, SPEAKER: 1 };
    const FIELD_ORDER = ['name', 'email', 'timezone', 'size', 'dietOther', 'session', 'company', 'vat', 'promo', 'conduct'];

    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });

    const blankForm = () => ({
        name: '',
        email: '',
        ticket: 'in-person',
        timezone: '',
        size: '',
        diet: 'none',
        dietOther: '',
        session: '',
        invoice: false,
        company: '',
        vat: '',
        promo: '',
        notes: '',
        conduct: false,
    });

    // Stand-in for the registration API; pages can provide their own `window.registrationApi`.
    const registrationApi = window.registrationApi ?? {
        register(payload) {
            return new Promise((resolve, reject) => setTimeout(() => {
                if (payload.email.endsWith('@taken.example')) {
                    reject(Object.assign(new Error('Validation failed'), { fields: { email: 'This email is already registered.' } }));
                } else {
                    resolve({ id: `BC26-${Math.random().toString(36).slice(2, 8).toUpperCase()}` });
                }
            }, 700));
        },
    };

    const app = brio.createApp({
        state: () => ({
            form: blankForm(),
            touched: {},
            serverErrors: {},
            serverError: '',
            submitted: false,
            submitting: false,
            confirmation: null,
            notesLimit: NOTES_LIMIT,
            tickets: [
                { id: 'in-person', label: 'In person', price: 449 },
                { id: 'virtual', label: 'Virtual', price: 99 },
                { id: 'workshop', label: 'In person + workshop', price: 649 },
            ],
            sessions: [
                { id: 'signals', title: 'Signals from scratch', details: 'Tue 9:30 · 3h · Intermediate', seats: 12 },
                { id: 'a11y', title: 'Accessible widgets', details: 'Tue 14:00 · 3h · All levels', seats: 3 },
                { id: 'islands', title: 'Islands architecture', details: 'Wed 9:30 · 2h · Advanced', seats: 0 },
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            timezones: ['Europe/Lisbon', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'],

            get ticket() {
                return this.tickets.find(ticket => ticket.id === this.form.ticket);
            },
            get inPerson() {
                return this.form.ticket !== 'virtual';
            },
            get promoRate() {
                return PROMOS[this.form.promo.toUpperCase()] ?? 0;
            },
            get discount() {
                return Math.round(this.ticket.price * this.promoRate);
            },
            get total() {
                return this.ticket.price - this.discount;
            },
            get notesLeft() {
                return NOTES_LIMIT - this.form.notes.length;
            },
            get errors() {
                const form = this.form;
                const errors = {};
                if (!form.name) errors.name = 'Enter your full name.';
                else if (form.name.length < 2) errors.name = 'Name must be at least 2 characters.';
                if (!form.email) errors.email = 'Enter your email address.';
                else if (!EMAIL.test(form.email)) errors.email = 'Enter an email like ada@company.com.';
                if (form.ticket === 'virtual' && !form.timezone) errors.timezone = 'Choose your time zone.';
                if (this.inPerson && !form.size) errors.size = 'Choose a T-shirt size.';
                if (this.inPerson && form.diet === 'other' && !form.dietOther) errors.dietOther = 'Describe your dietary needs.';
                if (form.ticket === 'workshop') {
                    const session = this.sessions.find(item => item.id === form.session);
                    if (!session) errors.session = 'Pick a workshop.';
                    else if (!session.seats) errors.session = 'That workshop is sold out.';
                }
                if (form.invoice && !form.company) errors.company = 'Enter the company to invoice.';
                if (form.invoice && form.vat && !VAT.test(form.vat.toUpperCase())) errors.vat = 'Use a country prefix and number, like PT123456789.';
                if (form.promo && !this.promoRate) errors.promo = 'That promo code is not valid.';
                if (!form.conduct) errors.conduct = 'You must agree to the code of conduct.';
                // Server rejections apply only to the exact value the server saw.
                for (const [field, rejection] of Object.entries(this.serverErrors)) {
                    if (form[field] === rejection.value) errors[field] ??= rejection.message;
                }
                return errors;
            },
            get errorList() {
                return FIELD_ORDER
                    .filter(field => this.errors[field])
                    .map(field => ({ field, message: this.errors[field] }));
            },
            get isValid() {
                return this.errorList.length === 0;
            },

            show(field) {
                return Boolean((this.submitted || this.touched[field]) && this.errors[field]);
            },
            touch(field) {
                if (field && !this.touched[field]) this.touched[field] = true;
            },
            money(amount) {
                return currency.format(amount);
            },
            async submit($ref) {
                if (this.submitting) return;
                this.submitted = true;
                this.serverError = '';
                if (!this.isValid) {
                    // Render the summary now so it can take focus inside this event handler.
                    brio.flush();
                    $ref.summary?.focus();
                    return;
                }
                this.submitting = true;
                const payload = this.payload();
                try {
                    const { id } = await registrationApi.register(payload);
                    this.confirmation = {
                        id,
                        firstName: payload.name.split(/\s+/)[0],
                        email: payload.email,
                        ticketLabel: this.ticket.label,
                        session: this.sessions.find(item => item.id === payload.session)?.title ?? '',
                        total: this.money(this.total),
                    };
                } catch (error) {
                    if (error.fields) {
                        this.serverErrors = Object.fromEntries(Object.entries(error.fields)
                            .map(([field, message]) => [field, { value: this.form[field], message }]));
                        $ref.summary?.focus();
                    } else {
                        this.serverError = 'We could not complete your registration. Please try again.';
                    }
                } finally {
                    this.submitting = false;
                }
            },
            payload() {
                const form = this.form;
                return {
                    name: form.name,
                    email: form.email.toLowerCase(),
                    ticket: form.ticket,
                    ...(this.inPerson
                        ? { size: form.size, diet: form.diet === 'other' ? form.dietOther : form.diet }
                        : { timezone: form.timezone }),
                    ...(form.ticket === 'workshop' ? { session: form.session } : {}),
                    ...(form.invoice ? { company: form.company, vat: form.vat.toUpperCase() || null } : {}),
                    promo: this.promoRate ? form.promo.toUpperCase() : null,
                    notes: form.notes.trim(),
                    total: this.total,
                };
            },
            startOver() {
                this.form = blankForm();
                this.touched = {};
                this.serverErrors = {};
                this.submitted = false;
                this.confirmation = null;
            },
        }),
    });

    app.mount('#registration-app');
    window.registrationApp = app;
})();
