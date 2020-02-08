using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Followers
{
    public class Add
    {
        public class Command : IRequest
        {
            public string Username { get; set; }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext context;
            private readonly IUserAccessor userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                this.userAccessor = userAccessor;
                this.context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                var observer = await context.Users.SingleOrDefaultAsync(u => u.UserName == userAccessor.GetCurrentUsername());
                var target = await context.Users.SingleOrDefaultAsync(u => u.UserName == request.Username);

                if (target == null) 
                    throw new RestException(HttpStatusCode.NotFound, new { User = "Not found" });

                var following = await context.Followings.SingleOrDefaultAsync(f => f.ObserverId == observer.Id && f.TargetId == target.Id);
                if (following != null) 
                {
                    throw new RestException(HttpStatusCode.BadRequest, new { User = "Already following"});
                }
                else 
                {
                    following = new UserFollowing
                    {
                        Observer = observer,
                        Target = target
                    };
                    context.Followings.Add(following);
                }

                var success = await context.SaveChangesAsync() > 0; // SaveChangesAsync returns # of changes persisted to DB.
                if (success) return Unit.Value;

                throw new Exception("Problem saving following");
            }
        }
    }
}