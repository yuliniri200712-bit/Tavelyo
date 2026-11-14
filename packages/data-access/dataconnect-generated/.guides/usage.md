# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertMyProfile, addMember, changeMemberRole, revokeMember, assignMemberBranch, unassignMemberBranch, myProfile, myMemberships, myBranches, tenantMembers } from '@tavelyo/dataconnect-sdk';


// Operation UpsertMyProfile:  For variables, look at type UpsertMyProfileVars in ../index.d.ts
const { data } = await UpsertMyProfile(dataConnect, upsertMyProfileVars);

// Operation AddMember:  For variables, look at type AddMemberVars in ../index.d.ts
const { data } = await AddMember(dataConnect, addMemberVars);

// Operation ChangeMemberRole:  For variables, look at type ChangeMemberRoleVars in ../index.d.ts
const { data } = await ChangeMemberRole(dataConnect, changeMemberRoleVars);

// Operation RevokeMember:  For variables, look at type RevokeMemberVars in ../index.d.ts
const { data } = await RevokeMember(dataConnect, revokeMemberVars);

// Operation AssignMemberBranch:  For variables, look at type AssignMemberBranchVars in ../index.d.ts
const { data } = await AssignMemberBranch(dataConnect, assignMemberBranchVars);

// Operation UnassignMemberBranch:  For variables, look at type UnassignMemberBranchVars in ../index.d.ts
const { data } = await UnassignMemberBranch(dataConnect, unassignMemberBranchVars);

// Operation MyProfile: 
const { data } = await MyProfile(dataConnect);

// Operation MyMemberships: 
const { data } = await MyMemberships(dataConnect);

// Operation MyBranches:  For variables, look at type MyBranchesVars in ../index.d.ts
const { data } = await MyBranches(dataConnect, myBranchesVars);

// Operation TenantMembers:  For variables, look at type TenantMembersVars in ../index.d.ts
const { data } = await TenantMembers(dataConnect, tenantMembersVars);


```