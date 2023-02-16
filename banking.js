const page = {
    urls: {
        getAllCustomers: AppBase.DOMAIN_API + '/customers?deleted=0',
        findCustomerById: AppBase.DOMAIN_API + "/customers",
        createCustomer: AppBase.DOMAIN_API + "/customers",
        updateCustomerById: AppBase.DOMAIN_API + "/customers",
        deleteCustomerById: AppBase.DOMAIN_API + "/customers",
        getAllCustomersWithoutID: AppBase.DOMAIN_API + "/customers",
        doDeposit: AppBase.DOMAIN_API + '/deposits',
        deleteDeposit: AppBase.DOMAIN_API + '/deposits',
    },
    elements: {},
    loadData: {},
    commands: {},
    dialogs: {
        elements: {},
        loadData: {},
        commands: {},
    }
}

let deposit = new Deposit;
let customer = new Customer;
let customers = [];
let currentCustomer = null;

page.elements.btnCreateCustomer = $('#btnCreateCustomer')
page.elements.btnShowCreateModal = $('#btnShowCreateModal');
page.elements.modelCreate = $(`#modalCreate`);

page.elements.btnUpdateCustomer = $(`#btnUpdateCustomer`);
page.elements.modalUpdate = $('#modalUpdate');

page.dialogs.elements.modalDeposit = $('#modalDeposit');
page.dialogs.elements.frmDeposit = $('#frmDeposit');
page.dialogs.elements.idDep = $('#idDep');
page.dialogs.elements.fullNameDep =$('#fullNameDep');
page.dialogs.elements.balanceDep =$('#balanceDep');
page.dialogs.elements.transactionAmountDep =$('#transactionAmountDep');
page.dialogs.elements.btnDeposit =$('#btnDeposit');


page.dialogs.commands.addEventUpdateCustomer = () => {
    $('.edit').on('click', function() {
        let id = $(this).data('id');
        page.loadData.findCustomerById(id).then((customer)=>{
            currentCustomer = customer;
            $('#fullNameUp').val(customer.fullName);
            $('#emailUp').val(customer.email);
            $('#phoneUp').val(customer.phone);
            $('#addressUp').val(customer.address);
            $('#modalUpdate').modal('show');
        })
        .catch(()=>{
            alert('Customer not found');
        })

    })
}
page.elements.addEventDeleteCustomer = () => {
    $('.delete').on(`click`, function (){
        let id = $(this).data('id');
        console.log(id);
        AppBase.SweetAlert.showDeleteConfirmDialog().then(result =>{
            if(result.isConfirmed){
                page.commands.checkCustomerById(id).then(()=>{
                    page.commands.deleteCustomer(id);
                })
                .catch(()=>{
                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Customer not found',
                    })
                })
            }
            
        })
    })
}
page.dialogs.commands.addEventDeposit = ()=>{
    $('.deposit').on('click', function () {
        let customerId = $(this).data('id');

        page.loadData.findCustomerById(customerId).then((data) => {
            currentCustomer = data;

            page.dialogs.elements.idDep.val(currentCustomer.id);
            page.dialogs.elements.fullNameDep.val(currentCustomer.fullName);
            page.dialogs.elements.balanceDep.val(currentCustomer.balance);

            page.dialogs.elements.modalDeposit.modal('show');
        })
        .catch(() => {
            AppBase.SweetAlert.showErrorAlert('Customer not found');
        })
    })
}

// page.dialogs.commands.addEventDeposit = () => {
//     $(`.deposit`).on('click', function(){
//         page.dialogs.elements.transactionAmountDep.val(null)
//         let id = $(this).data(`id`);
//         page.loadData.findCustomerById(id).then((customer)=>{
//             currentCustomer = customer;
//             $('#fullNameDep').val(customer.fullName);
//             $('#emailDep').val(customer.email);
//             $('#balanceDep').val(customer.balance);
            
//             $('#modalDeposit').modal('show');
//         })
//     })
// }


// get về phải thêm sự kiện
page.loadData.getAllCustomers = () =>{
    $.ajax({
        type: "GET",
        url: page.urls.getAllCustomers
    })
    .done((data) => {
        $.each(data, (i, item) => {
            let str = renderCustomer(item);
            $('#tbCustomer tbody').prepend(str);
        })
        page.dialogs.commands.addEventUpdateCustomer();
        page.elements.addEventDeleteCustomer();
        page.dialogs.commands.addEventDeposit();
        addEventTransfer();
    })
    .fail((error)=>{
        console.log(error);
    })
}

page.elements.btnShowCreateModal.on('click', ()=>{
    $(`#fullNameCre`).val(null);
    $(`#emailCre`).val(null);
    $(`#phoneCre`).val(null);
    $(`#addressCre`).val(null);
    page.elements.modelCreate.modal('show');
})


page.loadData.findCustomerById = (id)=>{
    return $.ajax({
        type: "GET",
        url: page.urls.findCustomerById + '/'+id
    })
    .fail((error)=>{
        console.log(error);
    })
}




page.loadData.getAllRecipients = (id) =>{
    $.ajax({
        type: "GET",
        url: page.urls.getAllCustomers+'&id_ne='+id
    })
    .done((data) => {
        $.each(data, (i, item) => {
            let str = renderRecipients(item);
            $('#recipientId').prepend(str);
        })
        
    })
    .fail((error)=>{
        console.log(error);
    })
}

let renderRecipients = (item)=>{
    return `<option>${item.fullName}</option>`
}

let addEventTransfer = ()=>{
    $(`.transfer`).on('click', function(){
        let id = $(this).data(`id`);
        page.loadData.findCustomerById(id).then((customer)=>{
            page.loadData.getAllRecipients(id);
            currentCustomer = customer;
            $('#senderName').val(customer.fullName);
            $('#senderEmail').val(customer.email);
            $('#senderPhone').val(customer.phone);
            $('#senderBalance').val(customer.balance);
            
            $('#modalTransfer').modal('show');
        })
    })
}





page.commands.checkCustomerById = (id) => {
    return $.ajax({
        type: "PATCH",
        url: page.urls.findCustomerById +'/'+id
    })
    .fail((error)=>{
        console.log(error);
    })
}

page.commands.deleteCustomer = (id) => {
    $.ajax({
        headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
        },
        type: "PATCH",
        url: page.urls.findCustomerById +'/'+id,
        data: JSON.stringify({deleted: 1})
    })
    .done(()=>{
        $('#tr_' + id).remove();
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Customer has been deleted.',
            showConfirmButton: false,
            timer: 2000
        })
    })
    .fail(() => {
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Failed to delete customer',
        })
    })
}



let updateCustomerById = (obj) => {
    customers.filter(item => {
        if (item.id == obj.id) {
            item.fullName = obj.fullName;
            item.email = obj.email;
            item.phone = obj.phone;
            item.address = obj.address;
        }
    })
}



let removeEventCreateCustomer = () => {
    $('.edit').off('click');
}

let removeEventDeposit = () => {
    $('.deposit').off('click');
}

let removeEventDelete = () => {
    $(`.delete`).off('click');
}
// Creat customer phải thêm sự kiện
let doCreateCustomer = () => {
    let fullName = $('#fullNameCre').val();
    let email = $('#emailCre').val();
    let phone = $('#phoneCre').val();
    let address = $('#addressCre').val();
    let balance = 0;
    let deleted = 0;
    let customer = new Customer();
    customer.fullName = fullName;
    customer.email = email;
    customer.phone = phone;
    customer.address = address;
    customer.balance = balance;
    customer.deleted = deleted;
    

    $.ajax({
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        type: "POST",
        url: page.urls.createCustomer,
        data: JSON.stringify(customer)
    })
    .done((data)=>{
        customer = data;
        let str = renderCustomer(customer);
        $('#tbCustomer tbody').prepend(str);
        removeEventCreateCustomer();
        page.dialogs.commands.addEventUpdateCustomer();
        removeEventDelete();
        page.elements.addEventDeleteCustomer();
        removeEventDeposit();
        page.dialogs.commands.addEventDeposit();

        addEventTransfer();

        $('#modalCreate').modal('hide');
        AppBase.SweetAlert.showSuccessAlert("Created new customer successfully")
    })
    .fail((error)=>{
        AppBase.SweetAlert.showErrorAlert('Created new customer failed')
    })
}

page.elements.btnCreateCustomer.on('click', () => {
    $('#frmCreateCustomer').trigger('submit');
})

page.elements.btnUpdateCustomer.on('click',()=>{
    $('#frmUpdateCustomer').trigger('submit');
})



page.commands.doUpdateCustomer = () => {
    let id = currentCustomer.id;
    let fullName = $('#fullNameUp').val();
    let email = $('#emailUp').val();
    let phone = $('#phoneUp').val();
    let address = $('#addressUp').val();
    
    currentCustomer.fullName = fullName;
    currentCustomer.email = email;
    currentCustomer.phone = phone;
    currentCustomer.address = address;

    $.ajax({
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        type: 'PATCH',
        url: page.urls.updateCustomerById + '/' + id,
        data: JSON.stringify(currentCustomer)
    })
    .done((data) => {
        currentCustomer = data;

        let newRow = renderCustomer(currentCustomer);
        let currentRow = $('#tr_' + id);

        currentRow.replaceWith(newRow);

        removeEventCreateCustomer();
        page.dialogs.commands.addEventUpdateCustomer();
        removeEventDelete();
        page.elements.addEventDeleteCustomer();
        removeEventDeposit();
        page.dialogs.commands.addEventDeposit();

        $('#modalUpdate').modal('hide');
        AppBase.SweetAlert.showSuccessAlert("Updated Customer Successfully")
    })
    .fail((error) => {
        AppBase.SweetAlert.showErrorAlert('Failed to update customer')
    })
    
}


page.dialogs.elements.btnDeposit.on('click', () => {
    page.dialogs.elements.frmDeposit.trigger('submit');
})


page.dialogs.commands.doDeposit = () => {
    let currentBalance = currentCustomer.balance;
    let transactionAmountDep = +page.dialogs.elements.transactionAmountDep.val();
    let newBalance = currentBalance + transactionAmountDep;
    currentCustomer.balance = newBalance;

    deposit.id = null;
    deposit.fullName = currentCustomer.fullName;
    deposit.transactionAmount = transactionAmountDep;

    page.dialogs.commands.createDeposit().then((data) => {
        deposit = data;
        
        page.dialogs.commands.incrementCustomerBalance(currentCustomer).then((data) => {

            currentCustomer = data;
            console.log("aaaaaa");
            let newRow = renderCustomer(currentCustomer);
            let currentRow = $('#tr_' + id);
            currentRow.replaceWith(newRow);

            page.dialogs.elements.modalDeposit.modal(`hide`);

            AppBase.SweetAlert.showSuccessAlert('Deposit success');
        })
        .catch(() => {
            page.dialogs.commands.deleteDeposit(deposit);
            AppBase.SweetAlert.showErrorAlert('Update customer fail');
        });
    })
    .catch(() => {
        AppBase.SweetAlert.showErrorAlert('Deposit fail');
    });
}

page.dialogs.commands.createDeposit = () => {
    return $.ajax({
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        type: 'POST',
        url: page.urls.doDeposit,
        data: JSON.stringify(deposit)
    })
    // .done((data) => {
    //     deposit = data;
    // })
}

page.dialogs.commands.incrementCustomerBalance = (customer) => {
    return $.ajax({
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        type: 'PATCH',
        url: page.urls.updateCustomerById + '/' + customer.id,
        data: JSON.stringify(customer)
    })
}

page.dialogs.commands.deleteDeposit = () => {
    $.ajax({
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        type: 'DELETE',
        url: page.urls.deleteDeposit + '/' + deposit.id
    })
}


let renderCustomer = (item) => {
    return `
        <tr id="tr_${item.id}">
            <td>${item.id}</td>
            <td>${item.fullName}</td>
            <td>${item.email}</td>
            <td>${item.phone}</td>
            <td>${item.balance}</td>
            <td>${item.address}</td>
            <td>
                <button class="btn btn-outline-secondary edit" data-id="${item.id}">
                    <i class="far fa-edit"></i>
                </button>
            </td>
            <td>
                <button class="btn btn-outline-success deposit" data-id="${item.id}"=>
                    <i class="fas fa-plus"></i>
                </button>
            </td>
            <td>
                <button class="btn btn-outline-primary transfer" data-id='${item.id}'>
                    <i class="fas fa-exchange-alt "  ></i>
                </button>
            </td>
            <td>
                <button class="btn btn-outline-danger delete" data-id="${item.id}">
                <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `;
}

$('#modalCreate').on('hidden.bs.modal', () => {
    $('#frmCreateCustomer')[0].reset();
    $('#frmCreateCustomer').validate().resetForm();
    
    $('#modalCreate .modal-alert-danger').empty().removeClass("show").addClass("hide");
    $('#frmCreateCustomer').find("input.error").removeClass("error");
})

$('#modalUpdate').on('hidden.bs.modal', () => {
    $('#frmUpdateCustomer')[0].reset();
    $('#frmUpdateCustomer').validate().resetForm();
    
    $('#modalUpdate .modal-alert-danger').empty().removeClass("show").addClass("hide");
    $('#frmUpdateCustomer').find("input.error").removeClass("error");
})

$('#modalDeposit').on('hidden.bs.modal', () => {
    page.dialogs.elements.frmDeposit[0].reset();
    page.dialogs.elements.frmDeposit.validate().resetForm();
    
    $('#modalDeposit .modal-alert-danger').empty().removeClass("show").addClass("hide");
    page.dialogs.elements.frmDeposit.find("input.error").removeClass("error");
})


$('#frmCreateCustomer').validate({
    rules: {
        fullNameCre: {
            required: true,
            minlength: 5,
            maxlength: 20
        },
        emailCre: {
            required: true,
            minlength: 5,
            maxlength: 40,
            
        },
    },
    messages: {
        fullNameCre: {
            required: 'Full name is required',
            minlength: 'Min character of full name is ${0}',
            maxlength: 'Max character of full name is ${0}'
        },
        emailCre: {
            required: 'Email is required',
            minlength: 'Min character of email is ${0}',
            maxlength: 'Max character of email is ${0}'
        },
    },
    errorLabelContainer: "#modalCreate .modal-alert-danger",
    errorPlacement: function (error, elements) {
        error.appendTo("#modalCreate .modal-alert-danger");
    },
    showErrors: function(errorMap, errorList) {
        if (this.numberOfInvalids() > 0) {
            $("#modalCreate .modal-alert-danger").removeClass("hide").addClass("show");
        } else {
            $("#modalCreate .modal-alert-danger").removeClass("show").addClass("hide").empty();
            $("#frmCreateCustomer input.error").removeClass("error");
        }
        this.defaultShowErrors();
    },
    submitHandler: function () {
        doCreateCustomer();
    }
});

$('#frmUpdateCustomer').validate({
    rules: {
        fullNameUp: {
            required: true,
            minlength: 5,
            maxlength: 20
        },
        emailUp: {
            required: true,
            minlength: 5,
            maxlength: 40,
            
        },
    },
    messages: {
        fullNameUp: {
            required: 'Full name is required',
            minlength: 'Min character of full name is ${0}',
            maxlength: 'Max character of full name is ${0}'
        },
        emailUp: {
            required: 'Email is required',
            minlength: 'Min character of email is ${0}',
            maxlength: 'Max character of email is ${0}'
        },
    },
    errorLabelContainer: "#modalUpdate .modal-alert-danger",
    errorPlacement: function (error, elements) {
        error.appendTo("#modalUpdate .modal-alert-danger");
    },
    showErrors: function(errorMap, errorList) {
        if (this.numberOfInvalids() > 0) {
            $("#modalUpdate .modal-alert-danger").removeClass("hide").addClass("show");
        } else {
            $("#modalUpdate .modal-alert-danger").removeClass("show").addClass("hide").empty();
            $("#frmCreateCustomer input.error").removeClass("error");
        }
        this.defaultShowErrors();
    },
    submitHandler: function () {
        page.commands.doUpdateCustomer();
    }
});

page.dialogs.elements.frmDeposit.validate({
    rules: {
        transactionAmountDep: {
            required: true,
            number: true,
            min: 1000,
            max: 1000000
        }
    },
    messages: {
        transactionAmountDep: {
            required: 'Transaction amount is required',
            number: 'Transaction amount must be number',
            min: 'Transaction amount must be more than ${0}',
            max: 'Transaction amount must be less than ${0}'
        }
    },
    errorLabelContainer: "#modalDeposit .modal-alert-danger",
    errorPlacement: function (error, element) {
        error.appendTo("#modalDeposit .modal-alert-danger");
    },
    showErrors: function(errorMap, errorList) {
        if (this.numberOfInvalids() > 0) {
            $("#modalDeposit .modal-alert-danger").removeClass("hide").addClass("show");
        } else {
            $("#modalDeposit .modal-alert-danger").removeClass("show").addClass("hide").empty();
            $("#frmDeposit input.error").removeClass("error");
        }
        this.defaultShowErrors();
    },
    submitHandler: function () {
        page.dialogs.commands.doDeposit();
    }
});

$(() => {
    page.loadData.getAllCustomers();
})







