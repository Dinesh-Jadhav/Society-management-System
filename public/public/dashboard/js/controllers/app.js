'use strict';


var socialApp = angular.module('socialApp', ['ngRoute', 'datatables', 'datatables.buttons', 'ngFileUpload', 'ngImgCrop', 'ui.bootstrap', 'googlechart', 'angular-hmac-sha512']);
socialApp.value('socketUrl', 'https://man2helpsm.herokuapp.com');
socialApp.config(function($routeProvider, $crypthmacProvider, $httpProvider) {

    /*$httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';*/

    /*Routes for admin*/
    $routeProvider.when('/admin-login', {
        controller: 'login',
        templateUrl: 'admin/login/login.html',
        title: 'Login | Admin'
    }).when('/resetPassword', {
        controller: 'resetPasswordController',
        templateUrl: 'admin/login/resetPassword.html',
        title: 'Reset Password | Admin'
    }).when('/newPassword/:token/:id', {
        controller: 'newPasswordController',
        templateUrl: 'admin/login/changePassword.html',
        title: 'New Password | Admin'
    }).when('/dashboard', {
        controller: 'AdminDashboard',
        templateUrl: 'admin/admin-panel/html/dashboard.html',
        activetab: 'dashboard',
        title: 'Dashboard | Admin'
    }).when('/add-society', {
        controller: 'society',
        templateUrl: 'admin/admin-panel/html/add-society.html',
        activetab: 'society',
        title: 'Add Society | Admin'
    }).when('/society-list', {
        controller: 'societyList',
        templateUrl: 'admin/admin-panel/html/society-list.html',
        activetab: 'society',
        title: 'All Societies | Admin'
    }).when('/delete-society/:societyId', {
        controller: 'societyList',
        templateUrl: 'admin/admin-panel/html/enter-password.html',
        title: 'Confirm Password | Admin'
    }).when('/add-blocks/:id', {
        controller: 'block',
        templateUrl: 'admin/admin-panel/html/add-blocks.html',
        activetab: 'society',
        title: 'Add Blocks | Admin'
    }).when('/edit-block/:blockId', {
        controller: 'editBlock',
        templateUrl: 'admin/admin-panel/html/edit-block.html',
        activetab: 'society',
        title: 'Edit Block | Admin'
    }).when('/block-list/:id', {
        controller: 'blockList',
        templateUrl: 'admin/admin-panel/html/block-list.html',
        activetab: 'society',
        title: 'Block List | Admin'
    }).when('/manager-list', {
        controller: 'managerList',
        templateUrl: 'admin/admin-panel/html/manager-list.html',
        activetab: 'managers',
        title: 'Managers | Admin'
    }).when('/add-manager', {
        controller: 'addManager',
        templateUrl: 'admin/admin-panel/html/add-manager.html',
        activetab: 'managers',
        title: 'Add Manager | Admin'
    }).when('/resident-list', {
        controller: 'residentsListForAdmin',
        templateUrl: 'admin/admin-panel/html/residents-list.html',
        activetab: 'residetns',
        title: 'Residents | Admin'
    }).when('/tenants-info-details/:tenantID', {
        controller: 'tenantDetailView',
        templateUrl: 'admin/admin-panel/html/tenant-full-detail-view.html',
        activetab: 'residetns',
        title: 'Tenant Details | Admin'
    }).when('/resident-info-details/:residentID', {
        templateUrl: 'admin/admin-panel/html/resident-info.html',
        controller: 'residentInfo',
        activetab: 'residetns',
        title: 'Resident Details | Admin'
    }).when('/add-service', {
        controller: 'service',
        templateUrl: 'admin/admin-panel/html/add-service.html',
        activetab: 'Service',
        title: 'Add Service | Admin'
    }).when('/service-list', {
        controller: 'serviceList',
        templateUrl: 'admin/admin-panel/html/service-list.html',
        activetab: 'Service',
        title: 'All Services Request | Admin'
    }).when('/service-all', {
        controller: 'serviceAll',
        templateUrl: 'admin/admin-panel/html/service-all.html',
        activetab: 'Service',
        title: 'All Services | Admin'
    }).when('/admin_game', {
        controller: 'games',
        templateUrl: 'admin/admin-panel/html/games.html',
        activetab: 'game',
        title: "Entertainments | Admin"
    }).when('/edit-society/:blockId', {
        controller: 'editSociety',
        templateUrl: 'admin/admin-panel/html/edit-society.html',
        activetab: 'society',
        title: 'Edit Society | Admin'
    });

    /*routes for manager*/
    $routeProvider.when('/society-manager-login', {
        controller: 'societyLogin',
        templateUrl: 'login/login.html',
        title: 'Login | Manager'
    }).when('/manager-reset-password', {
        controller: 'societyResetPasswordController',
        templateUrl: 'login/resetPassword.html',
        title: 'Reset Password | Manager'
    }).when('/manager-new-password/:token/:id', {
        controller: 'society-newPasswordController',
        templateUrl: 'login/changePassword.html',
        title: 'New Password | Manager'
    }).when('/select-block', {
        controller: 'selectBlock',
        templateUrl: 'society/html/select-block.html',
        title: 'Select BLock | Manager'
    }).when('/society-dashboard/:blockID', {
        controller: 'societyDashboard',
        templateUrl: 'society/html/dashboard.html',
        activetab: 'societyDashboard',
        title: 'Dashboard | Manager'
    }).when('/manage-society/:blockID/:id', {
        controller: 'societyListByID',
        templateUrl: 'society/html/society-list.html',
        activetab: 'manageSociety',
        title: 'Manage Society | Manager'
    }).when('/manager-edit-block/:blockID/:id', {
        controller: 'editBlock',
        templateUrl: 'society/html/edit-block.html',
        title: 'Edit Block | Manager'
    }).when('/manager-change-password/:blockID', {
        controller: 'changePassword',
        templateUrl: 'society/html/changePassword.html',
        title: 'Update Password | Manager'
    }).when('/society-flats/:blockID', {
        controller: 'flats',
        templateUrl: 'society/html/flats.html',
        activetab: 'manageFlats',
        title: 'Manage Flats | Manager'
    }).when('/add-resident/:blockID/:flatID', {
        controller: 'addResident',
        templateUrl: 'society/html/add-resident.html',
        activetab: 'manageFlats',
        title: 'Add Resident | Manager'
    }).when('/resident-list/:blockID', {
        templateUrl: 'society/html/resident-list.html',
        controller: 'residentList',
        activetab: 'residentList',
        title: 'All Residents | Manager'
    }).when('/resident-info/:blockID/:residentID', {
        templateUrl: 'society/html/resident-info.html',
        controller: 'residentInfo',
        activetab: 'residentList',
        title: 'Resident Details | Manager'
    }).when('/tenants-list/:blockID', {
        templateUrl: 'society/html/tenants-list.html',
        controller: 'tenantsList',
        activetab: 'residentList',
        title: 'All Tenants | Manager'
    }).when('/tenants-info/:blockID/:tenantID', {
        templateUrl: 'society/html/tenant-full-detail-view.html',
        controller: 'tenantDetailView',
        activetab: 'residentList',
        title: 'View Tenant Profile | Manager'
    }).when('/pending-complaint-list/:blockID', {
        templateUrl: 'society/html/complaint-list.html',
        controller: 'pendingComplaintList',
        activetab: 'Complaints',
        title: 'Pending Complaints | Manager'
    }).when('/underS-complaint-list/:blockID', {
        templateUrl: 'society/html/complaint-list.html',
        controller: 'usComplaintList',
        activetab: 'Complaints',
        title: 'Under Surveillance Complaints | Manager'
    }).when('/resolved-complaint-list/:blockID', {
        templateUrl: 'society/html/complaint-list.html',
        controller: 'resolvedComplaintList',
        activetab: 'Complaints',
        title: 'Resolved Complaints | Manager'
    }).when('/view-complaint-details/:blockID/:complaintID', {
        templateUrl: 'society/html/complaint-view.html',
        controller: 'viewComplaintDetails',
        activetab: 'Complaints',
        title: 'Complaint Details | Manager'
    }).when('/add-new-staff/:blockID', {
        templateUrl: 'society/html/add-staff.html',
        controller: 'addStaff',
        activetab: 'Staff',
        title: 'Add New Staff Member | Manager'
    }).when('/staff-list/:blockID', {
        templateUrl: 'society/html/list-staff.html',
        controller: 'listStaff',
        activetab: 'Staff',
        title: 'Staff Member | Manager'
    }).when('/staff-request-list/:blockID', {
        templateUrl: 'society/html/staff-request-list.html',
        controller: 'StaffReuestsForManager',
        activetab: 'Staff',
        title: 'Requests For Members | Manager'
    }).when('/delete-staff/:blockID/:staff_id', {
        templateUrl: 'society/html/enter-password.html',
        controller: 'deleteStaff',
        title: 'Confirm Password | Manager'
    }).when('/view-staff-details/:blockID/:staff_id', {
        templateUrl: 'society/html/staff-details.html',
        controller: 'staffDetails',
        activetab: 'Staff',
        title: 'View Member Details | Manager'
    }).when('/approve-request-for-staff/:staff_req_id', {
        templateUrl: 'society/html/staff-approve.html',
        controller: 'staffApprove',
        activetab: 'Staff',
        title: 'Approve Staff | Manager'
    }).when('/approve-request-for-facility/:facility_req_id', {
        templateUrl: 'society/html/staff-approve.html',
        controller: 'FacilityApprove',
        title: 'Approve FAcility Request | Manager'
    }).when('/view-staff-entry/:blockID', {
        templateUrl: 'society/html/view-staff-entry.html',
        controller: 'staffAttandanceForManager',
        activetab: 'Visitor',
        title: 'Staff Entry | Manager'
    }).when('/external-visitors/:blockID', {
        templateUrl: 'society/html/external-visitors.html',
        controller: 'ExternalVisitorsForManager',
        activetab: 'Visitor',
        title: 'External Visitors | Manager'
    }).when('/visitor-details-for-manager/:visitorID/:blockID', {
        controller: 'DetailVisitor',
        templateUrl: 'society/html/detail-visitor.html',
        activetab: 'Visitor',
        title: "Visitor's Detail | Manager"
    }).when('/create-job-card/:blockID', {
        controller: 'CreateJobCard',
        templateUrl: 'society/html/create-job-card.html',
        activetab: 'JobCard',
        title: "Create New Job Card | Manager"
    }).when('/facility-add/:blockID', {
        controller: 'AddFacility',
        templateUrl: 'society/html/facility-add.html',
        activetab: 'Facility',
        title: "Add New Facility | Manager"
    }).when('/facility-list/:blockID', {
        controller: 'ListFacility',
        templateUrl: 'society/html/facility-list.html',
        activetab: 'Facility',
        title: "All Facilities | Manager"
    }).when('/facility-requests/:blockID', {
        controller: 'RequestFacility',
        templateUrl: 'society/html/facility-requests.html',
        activetab: 'Facility',
        title: "Facility Requests | Manager"
    }).when('/add-vendor/:blockID', {
        controller: 'AddVendor',
        templateUrl: 'society/html/add-vendor.html',
        activetab: 'Vendors',
        title: "Add Vendor | Manager"
    }).when('/view-vendor/:blockID', {
        controller: 'ViewVendorForManager',
        templateUrl: 'society/html/view-vendor.html',
        activetab: 'Vendors',
        title: "All Vendor | Manager"
    }).when('/parking-managenent/:blockID', {
        controller: 'parking',
        templateUrl: 'society/html/manage_parking.html',
        activetab: 'manageParking',
        title: 'Manage Parking | Manager'
    }).when('/manage-parking/:blockID', {
        controller: 'parkingList',
        templateUrl: 'society/html/parking_manage.html',
        activetab: 'manageParking',
        title: 'Manage Parking | Manager'
    }).when('/add-notice/:blockID', {
        templateUrl: 'society/html/add-notice.html',
        controller: 'addNotice',
        activetab: 'Notice',
        title: 'Add New Notice | Manager'
    }).when('/view-notice/:blockID', {
        templateUrl: 'society/html/view-notice.html',
        controller: 'listOfNoticeToManager',
        activetab: 'Notice',
        title: 'All Notices | Manager'
    }).when('/eminity-add/:blockID', {
        controller: 'AddAmenity',
        templateUrl: 'society/html/eminity-add.html',
        activetab: 'Amelity',
        title: "Add New Amelity | Manager"
    }).when('/eminity-list/:blockID', {
        controller: 'ListAmenity',
        templateUrl: 'society/html/eminity-list.html',
        activetab: 'Amelity',
        title: "List Amelity | Manager"
    }).when('/eminity-requests/:blockID', {
        controller: 'RequestEminity',
        templateUrl: 'society/html/eminity-requests.html',
        activetab: 'Amelity',
        title: "Amelity Requests | Manager"
    }).when('/create-job-card/:blockID', {
        controller: 'CreateJobCard',
        templateUrl: 'society/html/create-job-card.html',
        activetab: 'JobCard',
        title: "Create New Job Card | Manager"
    }).when('/job-card-display/:blockID', {
        controller: 'RecurrentJobCard',
        templateUrl: 'society/html/job_card_display.html',
        activetab: 'JobCard',
        title: "Create New Job Card | Manager"
    }).when('/job-card-print/:blockID/:jobCardID', {
        controller: 'JobCardPrint',
        templateUrl: 'society/html/job-card-print.html',
        activetab: 'JobCard',
        title: "Job Card"
    }).when('/view-job-card/:blockID/:jobCardID', {
        controller: 'viewJobCard',
        templateUrl: 'society/html/view-job-card.html',
        activetab: 'JobCard',
        title: "Create New Job Card | Manager"
    }).when('/resident-transactions/:blockID', {
        controller: 'BlockIncomes',
        templateUrl: 'society/html/money-transaction.html',
        activetab: 'MoneyManager',
        title: "Block Incomes | Manager"
    }).when('/expense/:blockID', {
        controller: 'Expenses',
        templateUrl: 'society/html/expense.html',
        activetab: 'MoneyManager',
        title: "Block Expenses | Manager"
    }).when('/vendor-due/:blockID', {
        controller: 'Due',
        templateUrl: 'society/html/vendor-due.html',
        activetab: 'MoneyManager',
        title: "Block Expenses | Manager"
    }).when('/maintainance/:blockID', {
        controller: 'maintainanceManager',
        templateUrl: 'society/html/maintainance.html',
        activetab: 'MoneyManager',
        title: "Block Maintainance | Manager"
    }).when('/all-resident/:blockID/:maintainanceID', {
        controller: 'ResList',
        templateUrl: 'society/html/all-resident.html',
        activetab: 'MoneyManager',
        title: "Block Maintainance | Manager"
    }).when('/paid-resident/:blockID/:maintainanceID', {
        controller: 'PaidResidents',
        templateUrl: 'society/html/paid-resident.html',
        activetab: 'MoneyManager',
        title: "Block Maintainance | Manager"
    }).when('/unpaid-resident/:blockID/:maintainanceID', {
        controller: 'UnPaidResidents',
        templateUrl: 'society/html/unpaid-resident.html',
        activetab: 'MoneyManager',
        title: "Block Maintainance | Manager"
    }).when('/resident-maintainance', {
        templateUrl: 'resident/html/resident-maintainance.html',
        controller: 'MaintainanceResident',
        activetab: 'MoneyManager',
        title: 'Maintainance | Resident'
    }).when('/contribution-list/:blockID', {
        controller: 'ContributeList',
        templateUrl: 'society/html/contribution-list.html',
        activetab: 'Contribution',
        title: "Block Maintainance | Manager"
    }).when('/add-new-contribution/:blockID', {
        controller: 'Contribute',
        templateUrl: 'society/html/add-new-contribution.html',
        activetab: 'Contribution',
        title: "Block Maintainance | Manager"
    }).when('/manager_games/:blockID', {
        controller: 'games',
        templateUrl: 'society/html/games.html',
        activetab: 'game',
        title: "Entertainments | Manager"
    }).when('/request-for-service/:blockID', {
        controller: 'requestService',
        templateUrl: 'society/html/request-for-service.html',
        activetab: 'Servent',
        title: "Request For Service | Manager"
    }).when('/view-services/:blockID', {
        controller: 'Serviceall',
        templateUrl: 'society/html/view-service.html',
        activetab: 'Servent',
        title: "Request For Servent | Manager"
    });

    /*Routes for Front*/
    $routeProvider.when('/', {
        templateUrl: 'man2help/index.html',
    }).when('/all-society-list', {
        controller: 'societyFocietyList',
        templateUrl: 'man2help/society-list.html',
    }).when('/society/:slug', {
        controller: 'frontSociety',
        templateUrl: 'front/html/society-landing.html',
    }).when('/block/:societySlug/:blockSlug', {
        controller: 'blockLanding',
        templateUrl: 'front/html/block-landing.html',
    });

    /*Routes for  Resident's*/

    $routeProvider.when('/resident-login', {
        templateUrl: 'login/login.html',
        controller: 'residentLogin',
        title: 'Login | Resident'
    }).when('/resident-reset-password', {
        templateUrl: 'login/resetPassword.html',
        controller: 'residentRessetPassword',
        title: 'Reset Password | Resident'
    }).when('/resident-new-password/:token/:id', {
        templateUrl: 'login/changePassword.html',
        controller: 'residentChangePassword',
        title: 'New Password | Resident'
    }).when('/resident-profile-update', {
        templateUrl: 'resident/html/profile-details.html',
        controller: 'profiile',
        title: 'Profile | Resident'
    }).when('/resident-dashboard', {
        templateUrl: 'resident/html/dashboard.html',
        controller: 'residentDashboard',
        activetab: 'residentDashboard',
        title: 'Dashboard | Resident'
    }).when('/resident-complaint-log', {
        templateUrl: 'resident/html/complaint-log.html',
        controller: 'logComplaint',
        activetab: 'Complaints',
        title: 'Complaints | Log | Resident'
    }).when('/full-complaint-form/:complaintID', {
        templateUrl: 'resident/html/full-complaint-form.html',
        controller: 'fullComplaintForm',
        activetab: 'Complaints',
        title: 'Complaints | View Details | Resident'
    }).when('/complaint-list', {
        templateUrl: 'resident/html/complaint-list.html',
        controller: 'complaintList',
        activetab: 'Complaints',
        title: 'All Complaints | Resident'
    }).when('/tenant', {
        templateUrl: 'resident/html/assign-update-tenant.html',
        controller: 'tenantAssign',
        activetab: 'tenant',
        title: 'Add Tenant | Resident'
    }).when('/tenant-meta-details/:tenantID', {
        templateUrl: 'resident/html/tenant-other.html',
        controller: 'tenantOtherInfo',
        activetab: 'tenant',
        title: 'Tenant Other Details | Resident'
    }).when('/tenant-profile', {
        templateUrl: 'resident/html/tenant-profile.html',
        controller: 'tenantProfile',
        activetab: 'tenant',
        title: 'Tenant Profile | Resident'
    }).when('/all-tenant', {
        templateUrl: 'resident/html/all-tenant.html',
        controller: 'AllTenantOfResident',
        activetab: 'tenant',
        title: 'All Tenant | Resident'
    }).when('/bechelors-tenant', {
        templateUrl: 'resident/html/all-tenant.html',
        controller: 'bechelorsTenantOfResident',
        activetab: 'tenant',
        title: 'Bechelor Tenant | Resident'
    }).when('/families-tenant', {
        templateUrl: 'resident/html/all-tenant.html',
        controller: 'familiesTenantOfResident',
        activetab: 'tenant',
        title: 'Family Tenant | Resident'
    }).when('/tenant-full-detail-view/:tenantID', {
        templateUrl: 'resident/html/tenant-full-detail-view.html',
        controller: 'tenantDetailView',
        activetab: 'tenant',
        title: 'View Tenant Details | Resident'
    }).when('/neighbour', {
        templateUrl: 'resident/html/neighbour.html',
        controller: 'neighbours',
        activetab: 'neighbours',
        title: 'All Neighbours | Resident'
    }).when('/update-profile-details', {
        templateUrl: 'resident/html/my-profile.html',
        controller: 'updateProfile',
        title: 'My Profile | Resident'
    }).when('/visitors-for-resident', {
        controller: 'visitorsForResident',
        templateUrl: 'resident/html/visitors.html',
        activetab: 'Visitors',
        title: 'Visitors | Resident'
    }).when('/add-new-visitor-resident', {
        controller: 'AddVisitorResident',
        templateUrl: 'resident/html/add-visitors.html',
        activetab: 'Visitors',
        title: 'Add Visitors | Resident'
    }).when('/visitor-details-for-resident/:visitorID', {
        controller: 'DetailVisitor',
        templateUrl: 'resident/html/detail-visitor.html',
        activetab: 'Visitors',
        title: "Visitor's Detail | Resident"
    }).when('/request-for-servent', {
        controller: 'RequestServent',
        templateUrl: 'resident/html/request-for-servent.html',
        activetab: 'Servent',
        title: "Request For Servent | Resident"
    }).when('/view-servent-details/:staff_id', {
        templateUrl: 'resident/html/staff-details.html',
        controller: 'staffDetails',
        activetab: 'Servent',
        title: 'View Staff Details | Resident'
    }).when('/resident-staff-request', {
        templateUrl: 'resident/html/list-staff.html',
        controller: 'staffListForRessident',
        activetab: 'Servent',
        title: 'View Requested Servents | Resident'
    }).when('/resident-facility-request', {
        templateUrl: 'resident/html/facility-request-list.html',
        controller: 'RequestedFacilityListForResident',
        activetab: 'Facility',
        title: 'View Requested Facilities | Resident'
    }).when('/new-facility-request', {
        templateUrl: 'resident/html/facility-request-new.html',
        controller: 'newFacilityRequestForResident',
        activetab: 'Facility',
        title: 'Request For Facility | Resident'
    }).when('/resident-amenities-request', {
        templateUrl: 'resident/html/amenites-request-list.html',
        controller: 'RequestedListForResident',
        activetab: 'Amenities',
        title: 'View Requested Amenities | Resident'
    }).when('/new-amenities-request', {
        templateUrl: 'resident/html/amenites-request-new.html',
        controller: 'newAmilityRequestForResident',
        activetab: 'Amenities',
        title: 'Request For Amenities | Resident'
    }).when('/resident-dues', {
        templateUrl: 'resident/html/payment-dues.html',
        controller: 'PayDues',
        activetab: 'MoneyManager',
        title: 'Payment Dues | Resident'
    }).when('/money-transaction', {
        templateUrl: 'resident/html/money-transaction.html',
        controller: 'listTransaction',
        activetab: 'MoneyManager',
        title: 'Money Manager Transaction | Resident'
    }).when('/transaction-receipt/:transID', {
        templateUrl: 'resident/html/transaction-receipt.html',
        controller: 'printReceipt',
        activetab: 'MoneyManager',
        title: 'Money Manager Transaction | Resident'
    }).when('/familiy-members', {
        templateUrl: 'resident/html/familiy-members.html',
        controller: 'FamilyMembers',
        activetab: 'Familiy',
        title: 'Familiy Members | Resident'
    }).when('/add-new-family-member', {
        templateUrl: 'resident/html/add-new-family-member.html',
        controller: 'AddNewFamilyMembers',
        activetab: 'Familiy',
        title: 'Add New Familiy Members | Resident'
    }).when('/contributions', {
        templateUrl: 'resident/html/contributions.html',
        controller: 'contributions',
        activetab: 'MoneyManager',
        title: 'Contribution | Resident'
    }).when('/resident-contribution/:conID', {
        templateUrl: 'resident/html/resident-contri.html',
        controller: 'ResContribution',
        activetab: 'MoneyManager',
        title: 'Your Contribution | Resident'

    }).when('/resident_games', {
        controller: 'games',
        templateUrl: 'resident/html/games.html',
        activetab: 'game',
        title: "Entertainments | Manager"
    });

    /*For Security*/
    $routeProvider.when('/staff-login', {
        controller: 'staffLogin',
        templateUrl: 'login/login.html',
        title: 'Login | Staff Member'
    }).when('/staff-dashboard', {
        controller: 'staffDashboard',
        templateUrl: 'staff/html/dashboard.html',
        activetab: 'staffDashboard',
        title: 'Dashboard | Staff Member'
    }).when('/visitors-for-staff', {
        controller: 'visitorsForStaff',
        templateUrl: 'staff/html/visitors.html',
        activetab: 'Visitors',
        title: 'Visitors | Staff Member'
    }).when('/visitor-details-for-staff/:visitorID', {
        controller: 'DetailVisitor',
        templateUrl: 'staff/html/detail-visitor.html',
        activetab: 'Visitors',
        title: "Visitor's Detail | Staff Member"
    }).when('/add-new-visitor-staff', {
        controller: 'AddVisitorStaff',
        templateUrl: 'staff/html/add-visitor.html',
        activetab: 'Visitors',
        title: "Add New Visitor | Staff Member"
    }).when('/staff-entry', {
        controller: 'StaffEntryBySecurity',
        templateUrl: 'staff/html/staff-entry.html',
        activetab: 'StaffEntry',
        title: "Staff Entry | Staff Member"
    }).when('/vendors-entry', {
        controller: 'VendorEntryExit',
        templateUrl: 'staff/html/vendor-entry.html',
        activetab: 'VendorEntry',
        title: "Vendor Entry | Staff Member"
    }).when('/vendors-entry-view', {
        controller: 'VendorEntryView',
        templateUrl: 'staff/html/vendors.html',
        activetab: 'VendorEntry',
        title: "Vendor Entry | Staff Member"
    }).when('/vendors-in-view', {
        controller: 'VendorsInView',
        templateUrl: 'staff/html/vendors-in.html',
        activetab: 'VendorEntry',
        title: "Vendor Entry | Staff Member"
    }).when('/games', {
        controller: 'games',
        templateUrl: 'staff/html/game.html',
        activetab: 'game',
        title: "Entertainments | Staff Member"
    });

    /*Routes for 404*/
    $routeProvider.when('/404', {
        templateUrl: 'front/html/404.html',
        title: '404 | Man2help'
    }).otherwise({
        redirectTo: '/404'
    });
});

socialApp.run(['$rootScope', '$route', '$anchorScroll', function($rootScope, $route, $anchorScroll) {
    $rootScope.$on('$routeChangeSuccess', function() {
        document.title = $route.current.title;
        $anchorScroll();
    });
}]);

socialApp.controller('appController', ['$scope', function($scope) {
    $scope.$on('LOAD', function() { $scope.loader = true; });
    $scope.$on('UNLOAD', function() { $scope.loader = false; });
}]);
