using System.Linq;
using Application.Interfaces;
using AutoMapper;
using Domain;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class FollowingResolver : IValueResolver<UserActivity, AttendeeDto, bool>
    {
        private readonly DataContext context;
        private readonly IUserAccessor userAccessor;

        public FollowingResolver(DataContext context, IUserAccessor userAccessor)
        {
            this.userAccessor = userAccessor;
            this.context = context;
        }
        public bool Resolve(UserActivity source, AttendeeDto destination, bool destMember, ResolutionContext context)
        {
            var currentUser = this.context.Users.SingleOrDefaultAsync(x => x.UserName == userAccessor.GetCurrentUsername()).Result;
            
            return currentUser.Followings.Any(x => x.TargetId == source.AppUserId);
        }
    }
}