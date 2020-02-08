using System.Collections.Generic;
using Application.Profiles;
using MediatR;
using Microsoft.Extensions.Logging;
using Persistence;
using System.Threading.Tasks;
using System.Threading;
using Domain;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Application.Followers
{
    public class List
    {
        public class Query : IRequest<List<Profile>>
        {
            public string Username { get; set; }

            public string Predicate { get; set; }
        }

        public class Handler : IRequestHandler<Query, List<Profile>>
        {
            private readonly DataContext context;
            private readonly ILogger<List> logger;
            private readonly IProfileReader profileReader;

            public Handler(DataContext context, IProfileReader profileReader)
            {
                this.profileReader = profileReader;
                this.context = context;
            }

            public async Task<List<Profile>> Handle(Query request, CancellationToken cancellationToken)
            {
                var queryable = context.Followings.AsQueryable();
                var userFollowings = new List<UserFollowing>();
                var profiles = new List<Profile>();

                switch (request.Predicate)
                {
                    case "followers":
                        userFollowings = await queryable.Where(x => x.Target.UserName == request.Username).ToListAsync();
                        foreach(var follower in userFollowings) 
                        {
                            profiles.Add(await profileReader.ReadProfile(follower.Observer.UserName));
                        }
                        break;
                    case "following":
                        userFollowings = await queryable.Where(x => x.Observer.UserName == request.Username).ToListAsync();
                        foreach(var follower in userFollowings) 
                        {
                            profiles.Add(await profileReader.ReadProfile(follower.Target.UserName));
                        }
                        break;
                }

                return profiles;
            }
        }
    }
}
